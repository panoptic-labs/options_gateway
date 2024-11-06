import datetime
import math
import os
from typing import List, Tuple, Union

# Constants
UNI_MIN_TICK = -887272
UNI_MAX_TICK = 887272

class PanopticUtils:
    """Utility functions for Panoptic Protocol trading strategies."""

    @staticmethod
    def tick_to_absolute_price(tick: int) -> float:
        """Convert a Uniswap V3 tick to its absolute price."""
        return math.pow(10, tick * math.log10(1.0001))

    @staticmethod
    def absolute_price_to_adjusted_price(absolute_price: float, t0_decimals: int, t1_decimals: int) -> float:
        """Convert absolute price to adjusted price considering token decimals."""
        refactor = math.pow(10, t0_decimals - t1_decimals)
        return absolute_price * refactor

    @staticmethod
    def tick_to_adjusted_price(tick: int, t0_decimals: int, t1_decimals: int) -> float:
        """Convert a tick to adjusted price considering token decimals."""
        absolute_price = PanopticUtils.tick_to_absolute_price(tick)
        return PanopticUtils.absolute_price_to_adjusted_price(absolute_price, t0_decimals, t1_decimals)

    @staticmethod
    def adjusted_price_to_absolute_price(adjusted_price: float, t0_decimals: int, t1_decimals: int) -> float:
        """Convert adjusted price back to absolute price."""
        refactor = math.pow(10, t0_decimals - t1_decimals)
        return adjusted_price / refactor

    @staticmethod
    def absolute_price_to_tick(absolute_price: float) -> float:
        """Convert absolute price to a Uniswap V3 tick."""
        return math.log10(absolute_price) / math.log10(1.0001)

    @staticmethod
    def adjusted_price_to_tick(adjusted_price: float, t0_decimals: int, t1_decimals: int) -> float:
        """Convert adjusted price to a Uniswap V3 tick."""
        absolute_price = PanopticUtils.adjusted_price_to_absolute_price(adjusted_price, t0_decimals, t1_decimals)
        return PanopticUtils.absolute_price_to_tick(absolute_price)

    @staticmethod
    def log_spot_data(file_location: str, pool_id: str, spot_price: float, spot_tick: float) -> None:
        """Log spot price data to a file."""
        if not file_location.endswith('.dat'):
            raise ValueError("The file location must end with .dat")

        mode = 'a' if os.path.exists(file_location) else 'w'
        with open(file_location, mode) as file:
            current_time = datetime.datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
            file.write(f"{current_time}, {pool_id}, {spot_price}, {spot_tick}\n")

    @staticmethod
    def timescale_to_width(timescale: str, pool_tick_spacing: int) -> int:
        """Convert a timescale string to a tick width."""
        width_map = {
            '1H': 120,
            '1D': 720,
            '1W': 2400,
            '1M': 4800,
            '1Y': 16000
        }
        if timescale not in width_map:
            raise ValueError("Invalid timescale. Supported timescales are: 1H, 1D, 1W, 1M, 1Y")
        return math.ceil(width_map[timescale] / pool_tick_spacing)

    @staticmethod
    def width_to_timescale(width: int, pool_tick_spacing: int) -> str:
        """Convert a tick width back to a timescale string."""
        scaled_width = width * pool_tick_spacing
        width_map = {
            120: '1H',
            720: '1D',
            2400: '1W',
            4800: '1M',
            16000: '1Y'
        }
        for base_width, timescale in width_map.items():
            if math.ceil(base_width / pool_tick_spacing) == width:
                return timescale
        raise ValueError("Invalid width for the given pool tick spacing")

    @staticmethod
    def get_valid_tick(current_tick: int, tick_spacing: int, width: int) -> int:
        """Get the nearest valid tick for position creation."""
        min_tick = math.ceil(UNI_MIN_TICK / tick_spacing) * tick_spacing
        max_tick = math.floor(UNI_MAX_TICK / tick_spacing) * tick_spacing

        next_tick = math.floor(current_tick / tick_spacing) * tick_spacing
        tick_lower = next_tick - width // 2
        tick_upper = next_tick + width // 2

        # Adjust for boundaries
        if tick_lower < min_tick:
            next_tick += (min_tick - tick_lower)
        elif tick_upper > max_tick:
            next_tick -= (tick_upper - max_tick)

        # Ensure tick spacing alignment
        if ((tick_upper % tick_spacing != 0) or (tick_lower % tick_spacing != 0)):
            adjustment = tick_spacing // 2
            next_tick += adjustment if next_tick < current_tick else -adjustment

        return next_tick

# Optional: Create a global instance for easier imports
utils = PanopticUtils()
