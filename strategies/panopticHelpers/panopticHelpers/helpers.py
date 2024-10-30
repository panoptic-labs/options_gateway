import numpy as np 
import os
import datetime
import matplotlib.pyplot as plt

from .constants import (
    UNI_MIN_TICK, 
    UNI_MAX_TICK
)

def helloWorld():
    print("Hello World!")
    return 1

def tick_to_absolutePrice(tick):
    absolutePrice = np.power(10, tick*np.log10(1.0001))
    return absolutePrice

def absolutePrice_to_adjustedPrice(absolutePrice, t0_decimals, t1_decimals):
    refactor = np.power(10, t0_decimals-t1_decimals)
    adjustedPrice = absolutePrice * refactor
    return adjustedPrice

def tick_to_adjustedPrice(tick, t0_decimals, t1_decimals):
    absolutePrice = tick_to_absolutePrice(tick)
    adjustedPrice = absolutePrice_to_adjustedPrice(absolutePrice, t0_decimals, t1_decimals)
    return adjustedPrice

def adjustedPrice_to_absolutePrice(adjustedPrice, t0_decimals, t1_decimals):
    refactor = np.power(10, t0_decimals-t1_decimals)
    absolutePrice = adjustedPrice/refactor
    return absolutePrice

def absolutePrice_to_tick(absolutePrice):
    tick = np.log10(absolutePrice)/np.log10(1.0001)
    return tick

def adjustedPrice_to_tick(adjustedPrice, t0_decimals, t1_decimals):
    absolutePrice = adjustedPrice_to_absolutePrice(adjustedPrice, t0_decimals, t1_decimals)
    tick = absolutePrice_to_tick(absolutePrice)
    return tick

def log_spot_data(file_location, pool_id, spot_price, spot_tick): 
    print("File location: ", file_location)
    if file_location[-4:] != '.dat':
        raise ValueError("The file location must end with .dat")
    if os.path.exists(file_location):
        mode = 'a'  # Append mode
    else:
        mode = 'w'  # Write mode

    # Open the file and log the data
    with open(file_location, mode) as file:
        current_time = datetime.datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
        file.write(f"{current_time}, {pool_id}, {spot_price}, {spot_tick}\n")

def generate_spot_plot(file_location):
    # Read the data from the file
    if os.path.exists(file_location):
        with open(file_location, 'r') as file:
            data = file.readlines()
    else:
        raise FileNotFoundError(f"The file {file_location} does not exist.")

    # Extract the data
    timestamps = []
    spot_prices = []
    spot_ticks = []
    check_pool_id = None
    for line in data:
        timestamp, pool_id, spot_price, spot_tick = line.split(',')
        if ((pool_id != check_pool_id) and len(timestamps) > 1):
            raise ValueError(f"Pool ID mismatch - spot pricing for multiple pools in the same file.")
        check_pool_id = pool_id
        timestamps.append(timestamp)
        spot_prices.append(float(spot_price))
        spot_ticks.append(float(spot_tick))

    # Convert timestamps to UTC
    timestamps_utc = [datetime.datetime.strptime(ts, '%Y-%m-%d-%H:%M:%S').timestamp() for ts in timestamps]

    # Create the plots
    plt.figure(figsize=(12, 6))
    plt.plot(timestamps_utc, spot_prices, label='Spot Price')
    plt.xlabel('Timestamp')
    plt.ylabel('Value')
    plt.title(f'Spot Data for UniswapV3 Pool {pool_id}')
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plot_location = file_location.replace('.dat', '_spot_price.png')
    plt.savefig(plot_location)
    plt.close()

    plt.figure(figsize=(12, 6))
    plt.plot(timestamps_utc, spot_ticks, label='Spot Tick')
    plt.xlabel('Timestamp')
    plt.ylabel('Value')
    plt.title(f'Spot Data for UniswapV3 Pool {pool_id}')
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plot_location = file_location.replace('.dat', '_spot_tick.png')
    plt.savefig(plot_location)
    plt.close()

    return plot_location

def timescale_to_width(timescale, pool_tick_spacing):
    if timescale == '1H':
        return int(np.ceil(120 / pool_tick_spacing))
    elif timescale == '1D':
        return int(np.ceil(720 / pool_tick_spacing))
    elif timescale == '1W':
        return int(np.ceil(2400 / pool_tick_spacing))
    elif timescale == '1M':
        return int(np.ceil(4800 / pool_tick_spacing))
    elif timescale == '1Y':
        return int(np.ceil(16000 / pool_tick_spacing)) 
    else:
        raise ValueError("Invalid timescale. Supported timescales are: 1H, 1D, 1W, 1M, 1Y")

def width_to_timescale(width, pool_tick_spacing):
    if width == np.ceil(120 / pool_tick_spacing):
        return '1H'
    elif width == np.ceil(720 / pool_tick_spacing):
        return '1D'
    elif width == np.ceil(2400 / pool_tick_spacing):
        return '1W'
    elif width == np.ceil(4800 / pool_tick_spacing):
        return '1M'
    elif width == np.ceil(16000 / pool_tick_spacing):
        return '1Y'
    else:
        raise ValueError("Invalid width. Supported widths are: 120, 720, 2400, 4800, 16000")
    
import math

def get_valid_tick(current_tick: int, tick_spacing: int, width: int) -> int:
    min_tick = math.ceil(UNI_MIN_TICK / tick_spacing) * tick_spacing
    max_tick = math.floor(UNI_MAX_TICK / tick_spacing) * tick_spacing

    next_tick = math.floor(current_tick / tick_spacing) * tick_spacing
    tick_lower = next_tick - width // 2
    tick_upper = next_tick + width // 2

    # Ensure calculated tick_lower has floor of closest valid tick to min_tick and tick_upper has ceiling at closest valid tick to max_tick
    if tick_lower < min_tick:
        next_tick = next_tick + (min_tick - tick_lower)
        tick_lower = next_tick - width // 2
        tick_upper = next_tick + width // 2

    if tick_upper > max_tick:
        next_tick = next_tick - (tick_upper - max_tick)
        tick_lower = next_tick - width // 2
        tick_upper = next_tick + width // 2

    if ((tick_upper % tick_spacing != 0) or (tick_lower % tick_spacing != 0)):
        next_tick = next_tick + tick_spacing // 2 if next_tick < current_tick else next_tick - tick_spacing // 2

    return next_tick
