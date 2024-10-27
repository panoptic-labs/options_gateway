import numpy as np 
import os
import datetime
import matplotlib.pyplot as plt

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
