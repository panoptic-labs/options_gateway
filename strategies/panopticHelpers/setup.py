from setuptools import setup, find_packages

setup(
    name='panopticHelpers',
    version='0.1.0',
    description='A python package for Panoptic Protocol trading strategies',
    author='Nicholas DePorzio',
    author_email='ndeporzio@gmail.com',
    url='https://github.com/panoptic-labs/market_maker_bot',  # Update with your repository URL
    packages=find_packages(),
    install_requires=[
        'numpy',
    ],
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)