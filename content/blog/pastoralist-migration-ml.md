---
title: Modeling Pastoralist Migration in Samburu with Machine Learning
description: Using Remote Sensing, NDVI Vegetation Indexes, and climate/rainfall datasets to map herd routes and predict drought impact in Northern Kenya.
date: June 2, 2026
category: Data Science
---

Pastoralist communities in Samburu, Kenya, depend heavily on herd migration to locate grazing lands and water resources. Historically, these migration routes were planned using traditional knowledge. However, escalating climate variability and prolonged droughts have made traditional patterns less predictable, risking herd starvation and resource conflict.

By leveraging remote sensing data, we can model vegetation density and rainfall patterns to assist in predicting optimal migration pathways.

### Ingesting remote sensing datasets

We utilize Normalized Difference Vegetation Index (NDVI) satellite imagery alongside local meteorological rainfall indexes. The NDVI values measure the "greenness" of the ground canopy, which is directly correlated to available pasture:

1. **NDVI Ingestion**: Parse MODIS satellite datasets to extract regional NDVI profiles at a 250m resolution.
2. **Rainfall Indexes**: Standardized Precipitation Index (SPI) values derived from weather stations map historical water table shifts.

### Machine learning route prediction

Using Pandas and Scikit-Learn, we build a rolling anomaly classification model. By calculating deviations from historical NDVI baselines, the model predicts when key grazing zones will dry out up to 30 days in advance, allowing communities to map migration routes to areas with resilient pasture.

```python
# Python code calculating rolling NDVI (Normalized Difference Vegetation Index) anomaly scores
import pandas as pd
import numpy as np

def calculate_ndvi_anomaly(df, baseline_years=5):
    # Calculate baseline historical mean for each calendar month
    historical_mean = df[df['year'] < (df['year'].max() - baseline_years)] \
        .groupby('month')['ndvi'].mean().to_dict()

    # Calculate anomaly: current NDVI minus historical baseline mean
    df['ndvi_baseline'] = df['month'].map(historical_mean)
    df['ndvi_anomaly'] = df['ndvi'] - df['ndvi_baseline']

    # Flag regions showing acute drought risk (anomaly < -1.5 std dev)
    threshold = df['ndvi_anomaly'].std() * -1.5
    df['drought_warning'] = df['ndvi_anomaly'] < threshold
    return df
```
