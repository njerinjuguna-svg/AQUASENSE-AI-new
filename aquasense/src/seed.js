// src/seed.js - Self contained seed file

async function runSeed() {
  const crypto  = require('crypto');
  const User    = require('./models/User');
  const Sensor  = require('./models/Sensor');
  const Reading = require('./models/Reading');
  const Alert   = require('./models/Alert');
  const { calculateRiskLevel, generateExplanation, shouldTriggerAlert } = require('./utils/complianceEngine');

  const USERS = [
    { username: 'greenfield_admin', email: 'greenfield@aquasense.com', full_name: 'GreenField Pharmaceuticals', organization_type: 'pharmaceutical', password: 'Aqua@1234' },
    { username: 'bluewater_admin',  email: 'bluewater@aquasense.com',  full_name: 'BlueWater Processing Ltd',   organization_type: 'food',           password: 'Aqua@1234' },
    { username: 'riverfresh_admin', email: 'riverfresh@aquasense.com', full_name: 'RiverFresh Aquaculture',     organization_type: 'aquaculture',    password: 'Aqua@1234' },
    { username: 'cityschool_admin', email: 'cityschool@aquasense.com', full_name: 'City Central School',        organization_type: 'school',         password: 'Aqua@1234' },
    { username: 'sunrise_admin',    email: 'sunrise@aquasense.com',    full_name: 'Sunrise Bottling Company',   organization_type: 'food',           password: 'Aqua@1234' },
  ];

  const SENSORS = [
    { idx: 0, sensor_name: 'GreenField Primary Sensor',   location: 'Lagos Industrial Zone' },
    { idx: 1, sensor_name: 'BlueWater Main Monitor',      location: 'Abuja Treatment Facility' },
    { idx: 2, sensor_name: 'RiverFresh Water Probe',      location: 'Port Harcourt' },
    { idx: 3, sensor_name: 'City School Borehole Sensor', location: 'Abuja' },
    { idx: 4, sensor_name: 'Sunrise Bottling Sensor',     location: 'Lagos' },
  ];

  const READINGS = [
    {s:0,ph:7.25,t:23.1,tu:4.5,d:7.8},{s:0,ph:7.11,t:22.3,tu:5.1,d:6.2},{s:0,ph:7.03,t:21.5,tu:3.9,d:8.3},{s:0,ph:7.38,t:22.9,tu:3.2,d:9.5},{s:0,ph:7.45,t:20.7,tu:3.8,d:8.1},{s:0,ph:6.89,t:23.6,tu:4.6,d:7.2},{s:0,ph:7.19,t:21.2,tu:4.2,d:8.8},{s:0,ph:6.98,t:22.1,tu:3.7,d:6.9},{s:0,ph:7.31,t:20.4,tu:4.1,d:8.4},{s:0,ph:7.02,t:22.7,tu:4.8,d:7.5},
    {s:0,ph:7.24,t:22.4,tu:4.3,d:8.6},{s:0,ph:7.17,t:21.6,tu:3.6,d:7.1},{s:0,ph:6.95,t:22.3,tu:4.1,d:6.4},{s:0,ph:7.06,t:23.5,tu:3.7,d:9.2},{s:0,ph:7.48,t:20.8,tu:3.4,d:7.9},{s:0,ph:6.92,t:21.4,tu:4.9,d:6.8},{s:0,ph:7.11,t:22.0,tu:4.4,d:8.1},{s:0,ph:7.30,t:23.2,tu:3.5,d:9.6},{s:0,ph:7.13,t:21.1,tu:4.0,d:7.5},{s:0,ph:7.01,t:23.0,tu:4.7,d:8.9},
    {s:0,ph:7.22,t:21.8,tu:3.8,d:7.3},{s:0,ph:7.09,t:22.5,tu:4.5,d:8.7},{s:0,ph:6.97,t:20.9,tu:3.3,d:6.5},{s:0,ph:7.35,t:23.4,tu:4.0,d:9.1},{s:0,ph:7.14,t:21.3,tu:4.6,d:7.8},{s:0,ph:7.28,t:22.8,tu:3.9,d:8.4},{s:0,ph:6.93,t:20.5,tu:4.2,d:7.0},{s:0,ph:7.40,t:23.1,tu:3.6,d:9.3},{s:0,ph:7.07,t:21.7,tu:4.8,d:6.7},{s:0,ph:7.18,t:22.6,tu:3.4,d:8.2},
    {s:0,ph:7.26,t:20.6,tu:4.1,d:7.6},{s:0,ph:7.04,t:23.3,tu:4.7,d:9.4},{s:0,ph:6.96,t:21.9,tu:3.5,d:6.3},{s:0,ph:7.33,t:22.2,tu:4.3,d:8.8},{s:0,ph:7.10,t:20.3,tu:3.8,d:7.4},{s:0,ph:7.21,t:23.5,tu:4.5,d:9.0},{s:0,ph:6.94,t:21.0,tu:3.7,d:6.6},{s:0,ph:7.37,t:22.4,tu:4.0,d:8.5},{s:0,ph:7.08,t:20.8,tu:4.6,d:7.2},{s:0,ph:7.16,t:23.0,tu:3.3,d:9.7},
    {s:0,ph:7.29,t:21.5,tu:4.4,d:7.9},{s:0,ph:7.00,t:22.7,tu:3.6,d:8.1},{s:0,ph:6.91,t:20.4,tu:4.9,d:6.9},{s:0,ph:7.42,t:23.2,tu:3.2,d:9.5},{s:0,ph:7.12,t:21.6,tu:4.7,d:7.7},{s:0,ph:7.23,t:22.1,tu:3.9,d:8.6},{s:0,ph:6.99,t:20.7,tu:4.3,d:6.4},{s:0,ph:7.34,t:23.4,tu:3.5,d:9.2},{s:0,ph:7.05,t:21.2,tu:4.8,d:7.1},{s:0,ph:7.20,t:22.9,tu:3.7,d:8.3},
    {s:0,ph:7.27,t:20.5,tu:4.2,d:9.8},{s:0,ph:7.03,t:23.1,tu:3.8,d:7.0},{s:0,ph:6.88,t:21.8,tu:4.6,d:6.7},{s:0,ph:7.41,t:22.3,tu:3.4,d:9.1},{s:0,ph:7.15,t:20.9,tu:4.1,d:7.5},{s:0,ph:7.25,t:23.6,tu:3.7,d:8.9},{s:0,ph:6.95,t:21.3,tu:4.8,d:6.2},{s:0,ph:7.36,t:22.7,tu:3.3,d:9.6},{s:0,ph:7.09,t:20.6,tu:4.5,d:7.8},{s:0,ph:7.18,t:23.2,tu:3.9,d:8.4},
    {s:0,ph:7.32,t:21.4,tu:4.3,d:7.3},{s:0,ph:7.01,t:22.8,tu:3.6,d:9.0},{s:0,ph:6.93,t:20.3,tu:4.7,d:6.5},{s:0,ph:7.44,t:23.5,tu:3.1,d:9.9},{s:0,ph:7.11,t:21.7,tu:4.4,d:7.6},{s:0,ph:7.22,t:22.2,tu:3.8,d:8.7},{s:0,ph:6.97,t:20.8,tu:4.2,d:6.8},{s:0,ph:7.38,t:23.3,tu:3.5,d:9.3},{s:0,ph:7.06,t:21.1,tu:4.9,d:7.2},{s:0,ph:7.19,t:22.6,tu:3.7,d:8.1},
    {s:0,ph:7.30,t:20.4,tu:4.0,d:9.5},{s:0,ph:7.04,t:23.0,tu:3.4,d:7.9},{s:0,ph:6.90,t:21.6,tu:4.6,d:6.3},{s:0,ph:7.39,t:22.4,tu:3.2,d:9.2},{s:0,ph:7.13,t:20.7,tu:4.5,d:7.7},{s:0,ph:7.24,t:23.4,tu:3.8,d:8.5},{s:0,ph:6.96,t:21.0,tu:4.4,d:6.6},{s:0,ph:7.35,t:22.5,tu:3.6,d:9.4},{s:0,ph:7.08,t:20.5,tu:4.7,d:7.4},{s:0,ph:7.17,t:23.1,tu:3.9,d:8.8},
    {s:0,ph:7.28,t:21.3,tu:4.1,d:7.1},{s:0,ph:7.02,t:22.9,tu:3.5,d:9.7},{s:0,ph:6.92,t:20.2,tu:4.8,d:6.0},{s:0,ph:7.43,t:23.6,tu:3.3,d:9.8},{s:0,ph:7.10,t:21.5,tu:4.3,d:7.5},{s:0,ph:7.21,t:22.1,tu:3.7,d:8.2},{s:0,ph:6.98,t:20.9,tu:4.5,d:6.7},{s:0,ph:7.37,t:23.2,tu:3.4,d:9.0},{s:0,ph:7.07,t:21.4,tu:4.6,d:7.3},{s:0,ph:7.16,t:22.7,tu:3.8,d:8.6},
    {s:0,ph:7.26,t:23.1,tu:3.9,d:9.2},{s:0,ph:7.03,t:22.0,tu:4.2,d:7.6},{s:0,ph:7.15,t:23.2,tu:3.6,d:8.9},{s:0,ph:7.19,t:21.4,tu:4.3,d:7.8},{s:0,ph:7.11,t:22.7,tu:4.5,d:8.3},{s:0,ph:7.01,t:20.8,tu:4.6,d:7.1},{s:0,ph:7.31,t:22.5,tu:3.8,d:9.4},{s:0,ph:7.02,t:21.2,tu:4.7,d:7.5},{s:0,ph:7.25,t:23.0,tu:3.9,d:8.7},{s:0,ph:7.12,t:20.9,tu:4.4,d:8.2},
    {s:1,ph:7.20,t:22.5,tu:4.4,d:8.0},{s:1,ph:7.08,t:21.3,tu:3.8,d:7.5},{s:1,ph:6.98,t:22.8,tu:4.1,d:6.8},{s:1,ph:7.35,t:20.6,tu:3.5,d:9.3},{s:1,ph:7.12,t:23.1,tu:4.7,d:7.9},{s:1,ph:7.28,t:21.7,tu:3.9,d:8.5},{s:1,ph:6.95,t:22.4,tu:4.3,d:6.5},{s:1,ph:7.40,t:20.3,tu:3.6,d:9.0},{s:1,ph:7.06,t:23.5,tu:4.8,d:7.2},{s:1,ph:7.18,t:21.9,tu:3.7,d:8.8},
    {s:1,ph:7.25,t:22.2,tu:4.2,d:7.6},{s:1,ph:7.11,t:20.8,tu:3.4,d:9.1},{s:1,ph:6.97,t:23.3,tu:4.6,d:6.3},{s:1,ph:7.33,t:21.5,tu:3.8,d:8.7},{s:1,ph:7.15,t:22.0,tu:4.0,d:7.8},{s:1,ph:7.22,t:23.6,tu:3.5,d:9.4},{s:1,ph:6.93,t:20.4,tu:4.5,d:6.9},{s:1,ph:7.38,t:22.7,tu:3.2,d:9.2},{s:1,ph:7.09,t:21.2,tu:4.7,d:7.4},{s:1,ph:7.20,t:23.0,tu:3.9,d:8.3},
    {s:1,ph:7.27,t:21.6,tu:4.3,d:7.7},{s:1,ph:7.03,t:22.4,tu:3.6,d:9.6},{s:1,ph:6.91,t:20.7,tu:4.8,d:6.6},{s:1,ph:7.42,t:23.2,tu:3.3,d:9.1},{s:1,ph:7.14,t:21.1,tu:4.5,d:7.9},{s:1,ph:7.24,t:22.6,tu:3.7,d:8.4},{s:1,ph:6.99,t:20.5,tu:4.2,d:6.7},{s:1,ph:7.36,t:23.4,tu:3.5,d:9.5},{s:1,ph:7.05,t:21.8,tu:4.6,d:7.1},{s:1,ph:7.17,t:22.9,tu:3.8,d:8.6},
    {s:1,ph:7.29,t:20.6,tu:4.1,d:9.7},{s:1,ph:7.04,t:23.1,tu:3.7,d:7.3},{s:1,ph:6.89,t:21.4,tu:4.9,d:6.4},{s:1,ph:7.41,t:22.3,tu:3.4,d:9.2},{s:1,ph:7.13,t:20.9,tu:4.4,d:7.8},{s:1,ph:7.23,t:23.5,tu:3.6,d:8.9},{s:1,ph:6.96,t:21.3,tu:4.7,d:6.2},{s:1,ph:7.37,t:22.7,tu:3.3,d:9.8},{s:1,ph:7.08,t:20.8,tu:4.5,d:7.5},{s:1,ph:7.19,t:23.2,tu:3.9,d:8.2},
    {s:1,ph:7.31,t:21.5,tu:4.0,d:7.0},{s:1,ph:7.02,t:22.8,tu:3.5,d:9.3},{s:1,ph:6.94,t:20.3,tu:4.6,d:6.8},{s:1,ph:7.44,t:23.5,tu:3.2,d:9.9},{s:1,ph:7.10,t:21.7,tu:4.3,d:7.6},{s:1,ph:7.21,t:22.2,tu:3.8,d:8.7},{s:1,ph:6.98,t:20.8,tu:4.2,d:6.5},{s:1,ph:7.38,t:23.3,tu:3.5,d:9.0},{s:1,ph:7.06,t:21.1,tu:4.8,d:7.3},{s:1,ph:7.16,t:22.6,tu:3.7,d:8.1},
    {s:1,ph:7.26,t:20.4,tu:4.1,d:9.5},{s:1,ph:7.03,t:23.0,tu:3.4,d:7.8},{s:1,ph:6.88,t:21.6,tu:4.6,d:6.3},{s:1,ph:7.39,t:22.4,tu:3.2,d:9.1},{s:1,ph:7.12,t:20.7,tu:4.5,d:7.7},{s:1,ph:7.25,t:23.4,tu:3.8,d:8.5},{s:1,ph:6.95,t:21.0,tu:4.4,d:6.6},{s:1,ph:7.35,t:22.5,tu:3.6,d:9.4},{s:1,ph:7.07,t:20.5,tu:4.7,d:7.4},{s:1,ph:7.18,t:23.1,tu:3.9,d:8.8},
    {s:1,ph:7.28,t:21.3,tu:4.1,d:7.2},{s:1,ph:7.01,t:22.9,tu:3.5,d:9.7},{s:1,ph:6.92,t:20.2,tu:4.8,d:6.1},{s:1,ph:7.43,t:23.6,tu:3.3,d:9.8},{s:1,ph:7.11,t:21.5,tu:4.3,d:7.5},{s:1,ph:7.22,t:22.1,tu:3.7,d:8.2},{s:1,ph:6.97,t:20.9,tu:4.5,d:6.7},{s:1,ph:7.36,t:23.2,tu:3.4,d:9.0},{s:1,ph:7.08,t:21.4,tu:4.6,d:7.3},{s:1,ph:7.15,t:22.7,tu:3.8,d:8.6},
    {s:1,ph:7.30,t:20.6,tu:4.2,d:9.6},{s:1,ph:7.05,t:23.1,tu:3.6,d:7.9},{s:1,ph:6.90,t:21.8,tu:4.7,d:6.4},{s:1,ph:7.40,t:22.3,tu:3.3,d:9.2},{s:1,ph:7.14,t:20.9,tu:4.4,d:7.7},{s:1,ph:7.23,t:23.4,tu:3.8,d:8.5},{s:1,ph:6.96,t:21.1,tu:4.5,d:6.6},{s:1,ph:7.34,t:22.5,tu:3.6,d:9.3},{s:1,ph:7.09,t:20.5,tu:4.7,d:7.4},{s:1,ph:7.17,t:23.2,tu:4.0,d:8.7},
    {s:1,ph:7.27,t:21.4,tu:4.1,d:7.1},{s:1,ph:7.02,t:22.8,tu:3.5,d:9.5},{s:1,ph:6.93,t:20.3,tu:4.9,d:6.0},{s:1,ph:7.44,t:23.5,tu:3.1,d:9.9},{s:1,ph:7.11,t:21.6,tu:4.4,d:7.6},{s:1,ph:7.20,t:22.2,tu:3.8,d:8.3},{s:1,ph:6.99,t:20.8,tu:4.2,d:6.8},{s:1,ph:7.37,t:23.3,tu:3.5,d:9.1},{s:1,ph:7.07,t:21.1,tu:4.6,d:7.2},{s:1,ph:7.16,t:22.7,tu:3.8,d:8.1},
    {s:1,ph:7.26,t:23.1,tu:3.9,d:9.2},{s:1,ph:7.03,t:22.0,tu:4.2,d:7.6},{s:1,ph:7.15,t:23.2,tu:3.6,d:8.9},{s:1,ph:7.19,t:21.4,tu:4.3,d:7.8},{s:1,ph:7.11,t:22.7,tu:4.5,d:8.3},{s:1,ph:7.01,t:20.8,tu:4.6,d:7.1},{s:1,ph:7.31,t:22.5,tu:3.8,d:9.4},{s:1,ph:7.02,t:21.2,tu:4.7,d:7.5},{s:1,ph:7.25,t:23.0,tu:3.9,d:8.7},{s:1,ph:7.12,t:20.9,tu:4.4,d:8.2},
    {s:2,ph:7.18,t:23.0,tu:4.6,d:8.5},{s:2,ph:7.05,t:21.8,tu:3.9,d:7.0},{s:2,ph:6.95,t:22.5,tu:4.3,d:6.6},{s:2,ph:7.32,t:20.7,tu:3.6,d:9.2},{s:2,ph:7.08,t:23.2,tu:4.8,d:7.8},{s:2,ph:7.25,t:21.4,tu:3.8,d:8.6},{s:2,ph:6.92,t:22.1,tu:4.4,d:6.3},{s:2,ph:7.38,t:20.5,tu:3.5,d:9.5},{s:2,ph:7.03,t:23.4,tu:4.9,d:7.1},{s:2,ph:7.15,t:21.6,tu:3.7,d:8.9},
    {s:2,ph:7.22,t:22.3,tu:4.2,d:7.7},{s:2,ph:7.09,t:20.9,tu:3.4,d:9.0},{s:2,ph:6.94,t:23.1,tu:4.7,d:6.4},{s:2,ph:7.30,t:21.3,tu:3.9,d:8.8},{s:2,ph:7.12,t:22.0,tu:4.1,d:7.9},{s:2,ph:7.20,t:23.5,tu:3.6,d:9.3},{s:2,ph:6.90,t:20.2,tu:4.6,d:6.7},{s:2,ph:7.35,t:22.6,tu:3.3,d:9.1},{s:2,ph:7.06,t:21.0,tu:4.8,d:7.3},{s:2,ph:7.17,t:23.2,tu:3.8,d:8.4},
    {s:2,ph:7.24,t:21.7,tu:4.4,d:7.6},{s:2,ph:7.01,t:22.4,tu:3.7,d:9.5},{s:2,ph:6.89,t:20.8,tu:4.9,d:6.5},{s:2,ph:7.40,t:23.3,tu:3.2,d:9.0},{s:2,ph:7.11,t:21.2,tu:4.6,d:7.8},{s:2,ph:7.21,t:22.7,tu:3.8,d:8.3},{s:2,ph:6.97,t:20.6,tu:4.2,d:6.8},{s:2,ph:7.34,t:23.4,tu:3.6,d:9.4},{s:2,ph:7.04,t:21.9,tu:4.7,d:7.0},{s:2,ph:7.14,t:22.8,tu:3.9,d:8.7},
    {s:2,ph:7.27,t:20.5,tu:4.0,d:9.8},{s:2,ph:7.02,t:23.1,tu:3.5,d:7.4},{s:2,ph:6.87,t:21.4,tu:4.8,d:6.2},{s:2,ph:7.39,t:22.2,tu:3.4,d:9.3},{s:2,ph:7.10,t:20.7,tu:4.5,d:7.7},{s:2,ph:7.22,t:23.5,tu:3.7,d:8.6},{s:2,ph:6.93,t:21.1,tu:4.4,d:6.5},{s:2,ph:7.36,t:22.4,tu:3.3,d:9.7},{s:2,ph:7.05,t:20.6,tu:4.6,d:7.2},{s:2,ph:7.16,t:23.2,tu:3.9,d:8.1},
    {s:2,ph:7.29,t:21.3,tu:4.3,d:7.5},{s:2,ph:7.00,t:22.9,tu:3.6,d:9.2},{s:2,ph:6.91,t:20.4,tu:4.7,d:6.8},{s:2,ph:7.42,t:23.6,tu:3.1,d:9.9},{s:2,ph:7.08,t:21.8,tu:4.4,d:7.6},{s:2,ph:7.19,t:22.1,tu:3.8,d:8.7},{s:2,ph:6.96,t:20.9,tu:4.3,d:6.4},{s:2,ph:7.37,t:23.3,tu:3.4,d:9.0},{s:2,ph:7.07,t:21.2,tu:4.9,d:7.1},{s:2,ph:7.18,t:22.7,tu:3.7,d:8.2},
    {s:2,ph:7.26,t:20.4,tu:4.2,d:9.6},{s:2,ph:7.04,t:23.0,tu:3.5,d:7.8},{s:2,ph:6.88,t:21.7,tu:4.7,d:6.3},{s:2,ph:7.38,t:22.3,tu:3.3,d:9.1},{s:2,ph:7.13,t:20.8,tu:4.5,d:7.7},{s:2,ph:7.23,t:23.4,tu:3.8,d:8.5},{s:2,ph:6.94,t:21.0,tu:4.4,d:6.6},{s:2,ph:7.33,t:22.5,tu:3.7,d:9.3},{s:2,ph:7.06,t:20.5,tu:4.8,d:7.4},{s:2,ph:7.15,t:23.1,tu:3.9,d:8.8},
    {s:2,ph:7.28,t:21.4,tu:4.1,d:7.2},{s:2,ph:7.00,t:22.8,tu:3.6,d:9.5},{s:2,ph:6.93,t:20.2,tu:4.8,d:6.1},{s:2,ph:7.43,t:23.5,tu:3.2,d:9.8},{s:2,ph:7.10,t:21.6,tu:4.4,d:7.6},{s:2,ph:7.21,t:22.1,tu:3.7,d:8.3},{s:2,ph:6.97,t:20.9,tu:4.5,d:6.7},{s:2,ph:7.35,t:23.2,tu:3.4,d:9.2},{s:2,ph:7.07,t:21.4,tu:4.6,d:7.3},{s:2,ph:7.16,t:22.6,tu:3.8,d:8.6},
    {s:2,ph:7.31,t:20.6,tu:4.2,d:9.6},{s:2,ph:7.05,t:23.1,tu:3.6,d:7.9},{s:2,ph:6.90,t:21.8,tu:4.7,d:6.4},{s:2,ph:7.40,t:22.3,tu:3.3,d:9.3},{s:2,ph:7.14,t:20.9,tu:4.4,d:7.7},{s:2,ph:7.24,t:23.4,tu:3.8,d:8.5},{s:2,ph:6.95,t:21.1,tu:4.5,d:6.6},{s:2,ph:7.33,t:22.5,tu:3.7,d:9.4},{s:2,ph:7.08,t:20.5,tu:4.7,d:7.4},{s:2,ph:7.17,t:23.2,tu:4.0,d:8.7},
    {s:2,ph:7.27,t:21.4,tu:4.1,d:7.1},{s:2,ph:7.02,t:22.8,tu:3.5,d:9.5},{s:2,ph:6.93,t:20.3,tu:4.9,d:6.0},{s:2,ph:7.44,t:23.5,tu:3.1,d:9.9},{s:2,ph:7.12,t:21.6,tu:4.4,d:7.6},{s:2,ph:7.20,t:22.2,tu:3.8,d:8.3},{s:2,ph:6.98,t:20.8,tu:4.2,d:6.8},{s:2,ph:7.36,t:23.3,tu:3.5,d:9.1},{s:2,ph:7.06,t:21.1,tu:4.7,d:7.2},{s:2,ph:7.15,t:22.7,tu:3.8,d:8.1},
    {s:2,ph:7.25,t:23.1,tu:3.9,d:9.2},{s:2,ph:7.03,t:22.0,tu:4.2,d:7.6},{s:2,ph:7.14,t:23.2,tu:3.6,d:8.9},{s:2,ph:7.18,t:21.4,tu:4.3,d:7.8},{s:2,ph:7.10,t:22.7,tu:4.5,d:8.3},{s:2,ph:7.00,t:20.8,tu:4.6,d:7.1},{s:2,ph:7.30,t:22.5,tu:3.8,d:9.4},{s:2,ph:7.01,t:21.2,tu:4.7,d:7.5},{s:2,ph:7.24,t:23.0,tu:3.9,d:8.7},{s:2,ph:7.11,t:20.9,tu:4.4,d:8.2},
    {s:3,ph:7.15,t:22.8,tu:4.5,d:8.2},{s:3,ph:7.02,t:21.5,tu:3.8,d:7.3},{s:3,ph:6.96,t:22.7,tu:4.2,d:6.7},{s:3,ph:7.33,t:20.5,tu:3.5,d:9.4},{s:3,ph:7.10,t:23.0,tu:4.7,d:7.7},{s:3,ph:7.26,t:21.6,tu:3.9,d:8.7},{s:3,ph:6.93,t:22.3,tu:4.3,d:6.4},{s:3,ph:7.41,t:20.4,tu:3.6,d:9.2},{s:3,ph:7.04,t:23.3,tu:4.8,d:7.0},{s:3,ph:7.16,t:21.8,tu:3.7,d:8.6},
    {s:3,ph:7.23,t:22.1,tu:4.1,d:7.5},{s:3,ph:7.07,t:20.7,tu:3.4,d:9.1},{s:3,ph:6.95,t:23.2,tu:4.6,d:6.5},{s:3,ph:7.31,t:21.4,tu:3.8,d:8.9},{s:3,ph:7.13,t:22.0,tu:4.0,d:7.6},{s:3,ph:7.21,t:23.4,tu:3.5,d:9.5},{s:3,ph:6.91,t:20.3,tu:4.5,d:6.8},{s:3,ph:7.36,t:22.6,tu:3.2,d:9.3},{s:3,ph:7.08,t:21.1,tu:4.7,d:7.2},{s:3,ph:7.18,t:23.1,tu:3.8,d:8.1},
    {s:3,ph:7.25,t:21.6,tu:4.3,d:7.8},{s:3,ph:7.04,t:22.3,tu:3.6,d:9.7},{s:3,ph:6.90,t:20.6,tu:4.9,d:6.6},{s:3,ph:7.43,t:23.2,tu:3.3,d:9.0},{s:3,ph:7.12,t:21.3,tu:4.6,d:7.9},{s:3,ph:7.22,t:22.8,tu:3.7,d:8.4},{s:3,ph:6.98,t:20.4,tu:4.2,d:6.6},{s:3,ph:7.35,t:23.4,tu:3.5,d:9.6},{s:3,ph:7.06,t:21.7,tu:4.7,d:7.0},{s:3,ph:7.15,t:22.9,tu:3.8,d:8.5},
    {s:3,ph:7.28,t:20.7,tu:4.0,d:9.8},{s:3,ph:7.03,t:23.0,tu:3.6,d:7.5},{s:3,ph:6.88,t:21.3,tu:4.8,d:6.3},{s:3,ph:7.40,t:22.2,tu:3.4,d:9.3},{s:3,ph:7.11,t:20.8,tu:4.5,d:7.8},{s:3,ph:7.24,t:23.5,tu:3.6,d:8.8},{s:3,ph:6.94,t:21.2,tu:4.4,d:6.5},{s:3,ph:7.38,t:22.4,tu:3.3,d:9.7},{s:3,ph:7.07,t:20.5,tu:4.6,d:7.3},{s:3,ph:7.17,t:23.1,tu:3.9,d:8.0},
    {s:3,ph:7.30,t:21.2,tu:4.2,d:7.6},{s:3,ph:7.01,t:22.7,tu:3.6,d:9.3},{s:3,ph:6.93,t:20.3,tu:4.7,d:6.7},{s:3,ph:7.45,t:23.5,tu:3.1,d:9.9},{s:3,ph:7.09,t:21.6,tu:4.4,d:7.5},{s:3,ph:7.20,t:22.1,tu:3.8,d:8.6},{s:3,ph:6.97,t:20.7,tu:4.3,d:6.5},{s:3,ph:7.37,t:23.2,tu:3.4,d:9.1},{s:3,ph:7.05,t:21.1,tu:4.8,d:7.2},{s:3,ph:7.14,t:22.6,tu:3.7,d:8.1},
    {s:3,ph:7.27,t:20.5,tu:4.1,d:9.5},{s:3,ph:7.04,t:23.0,tu:3.4,d:7.9},{s:3,ph:6.89,t:21.7,tu:4.6,d:6.3},{s:3,ph:7.39,t:22.4,tu:3.3,d:9.2},{s:3,ph:7.13,t:20.8,tu:4.5,d:7.7},{s:3,ph:7.25,t:23.3,tu:3.8,d:8.4},{s:3,ph:6.96,t:21.0,tu:4.4,d:6.6},{s:3,ph:7.34,t:22.5,tu:3.7,d:9.4},{s:3,ph:7.08,t:20.4,tu:4.7,d:7.4},{s:3,ph:7.16,t:23.1,tu:3.9,d:8.9},
    {s:3,ph:7.29,t:21.3,tu:4.1,d:7.1},{s:3,ph:7.01,t:22.9,tu:3.5,d:9.6},{s:3,ph:6.92,t:20.2,tu:4.9,d:6.0},{s:3,ph:7.44,t:23.6,tu:3.2,d:9.8},{s:3,ph:7.10,t:21.5,tu:4.4,d:7.5},{s:3,ph:7.22,t:22.1,tu:3.7,d:8.3},{s:3,ph:6.97,t:20.9,tu:4.5,d:6.7},{s:3,ph:7.36,t:23.2,tu:3.4,d:9.0},{s:3,ph:7.07,t:21.4,tu:4.6,d:7.3},{s:3,ph:7.15,t:22.7,tu:3.8,d:8.7},
    {s:3,ph:7.31,t:20.7,tu:4.2,d:9.6},{s:3,ph:7.05,t:23.1,tu:3.6,d:7.9},{s:3,ph:6.90,t:21.8,tu:4.7,d:6.4},{s:3,ph:7.41,t:22.3,tu:3.3,d:9.2},{s:3,ph:7.14,t:20.9,tu:4.4,d:7.7},{s:3,ph:7.23,t:23.4,tu:3.8,d:8.6},{s:3,ph:6.95,t:21.1,tu:4.4,d:6.7},{s:3,ph:7.33,t:22.5,tu:3.7,d:9.3},{s:3,ph:7.08,t:20.5,tu:4.7,d:7.4},{s:3,ph:7.17,t:23.2,tu:4.0,d:8.7},
    {s:3,ph:7.27,t:21.4,tu:4.0,d:7.2},{s:3,ph:7.02,t:22.8,tu:3.5,d:9.5},{s:3,ph:6.93,t:20.3,tu:4.9,d:6.1},{s:3,ph:7.44,t:23.5,tu:3.1,d:9.9},{s:3,ph:7.12,t:21.6,tu:4.3,d:7.6},{s:3,ph:7.20,t:22.2,tu:3.8,d:8.3},{s:3,ph:6.98,t:20.8,tu:4.2,d:6.8},{s:3,ph:7.36,t:23.3,tu:3.5,d:9.0},{s:3,ph:7.06,t:21.1,tu:4.7,d:7.2},{s:3,ph:7.15,t:22.7,tu:3.8,d:8.1},
    {s:3,ph:7.25,t:23.1,tu:3.9,d:9.2},{s:3,ph:7.03,t:22.0,tu:4.2,d:7.6},{s:3,ph:7.14,t:23.2,tu:3.6,d:8.9},{s:3,ph:7.18,t:21.4,tu:4.3,d:7.8},{s:3,ph:7.10,t:22.7,tu:4.5,d:8.3},{s:3,ph:7.00,t:20.8,tu:4.6,d:7.1},{s:3,ph:7.30,t:22.5,tu:3.8,d:9.4},{s:3,ph:7.01,t:21.2,tu:4.7,d:7.5},{s:3,ph:7.24,t:23.0,tu:3.9,d:8.7},{s:3,ph:7.11,t:20.9,tu:4.4,d:8.2},
    {s:4,ph:7.22,t:22.6,tu:4.3,d:8.4},{s:4,ph:7.09,t:21.4,tu:3.7,d:7.6},{s:4,ph:6.99,t:22.9,tu:4.1,d:6.9},{s:4,ph:7.36,t:20.8,tu:3.4,d:9.5},{s:4,ph:7.14,t:23.3,tu:4.6,d:7.9},{s:4,ph:7.29,t:21.5,tu:3.8,d:8.7},{s:4,ph:6.94,t:22.2,tu:4.4,d:6.3},{s:4,ph:7.41,t:20.6,tu:3.5,d:9.1},{s:4,ph:7.05,t:23.5,tu:4.8,d:7.1},{s:4,ph:7.17,t:21.7,tu:3.6,d:8.8},
    {s:4,ph:7.24,t:22.4,tu:4.1,d:7.6},{s:4,ph:7.11,t:21.0,tu:3.3,d:9.2},{s:4,ph:6.96,t:23.2,tu:4.7,d:6.4},{s:4,ph:7.32,t:21.6,tu:3.8,d:8.8},{s:4,ph:7.14,t:22.1,tu:4.0,d:7.7},{s:4,ph:7.21,t:23.6,tu:3.4,d:9.4},{s:4,ph:6.92,t:20.5,tu:4.6,d:6.8},{s:4,ph:7.37,t:22.7,tu:3.1,d:9.2},{s:4,ph:7.08,t:21.2,tu:4.8,d:7.3},{s:4,ph:7.19,t:23.1,tu:3.7,d:8.2},
    {s:4,ph:7.26,t:21.8,tu:4.3,d:7.7},{s:4,ph:7.03,t:22.5,tu:3.5,d:9.6},{s:4,ph:6.90,t:20.7,tu:4.9,d:6.5},{s:4,ph:7.42,t:23.3,tu:3.2,d:9.1},{s:4,ph:7.13,t:21.3,tu:4.5,d:7.9},{s:4,ph:7.23,t:22.8,tu:3.7,d:8.3},{s:4,ph:6.98,t:20.5,tu:4.2,d:6.7},{s:4,ph:7.35,t:23.4,tu:3.5,d:9.5},{s:4,ph:7.06,t:21.8,tu:4.7,d:7.0},{s:4,ph:7.16,t:22.9,tu:3.8,d:8.6},
    {s:4,ph:7.28,t:20.6,tu:4.1,d:9.7},{s:4,ph:7.03,t:23.1,tu:3.5,d:7.4},{s:4,ph:6.88,t:21.5,tu:4.8,d:6.2},{s:4,ph:7.40,t:22.3,tu:3.4,d:9.4},{s:4,ph:7.12,t:20.8,tu:4.5,d:7.7},{s:4,ph:7.22,t:23.5,tu:3.7,d:8.5},{s:4,ph:6.94,t:21.1,tu:4.3,d:6.5},{s:4,ph:7.37,t:22.4,tu:3.3,d:9.8},{s:4,ph:7.06,t:20.5,tu:4.6,d:7.2},{s:4,ph:7.15,t:23.2,tu:3.9,d:8.0},
    {s:4,ph:7.30,t:21.3,tu:4.2,d:7.5},{s:4,ph:7.01,t:22.8,tu:3.5,d:9.2},{s:4,ph:6.92,t:20.3,tu:4.7,d:6.7},{s:4,ph:7.46,t:23.5,tu:3.1,d:9.9},{s:4,ph:7.09,t:21.7,tu:4.4,d:7.6},{s:4,ph:7.20,t:22.1,tu:3.8,d:8.7},{s:4,ph:6.97,t:20.8,tu:4.3,d:6.5},{s:4,ph:7.38,t:23.2,tu:3.4,d:9.1},{s:4,ph:7.06,t:21.2,tu:4.9,d:7.1},{s:4,ph:7.15,t:22.7,tu:3.7,d:8.2},
    {s:4,ph:7.27,t:20.4,tu:4.1,d:9.5},{s:4,ph:7.04,t:23.0,tu:3.4,d:7.8},{s:4,ph:6.88,t:21.6,tu:4.7,d:6.3},{s:4,ph:7.39,t:22.4,tu:3.2,d:9.2},{s:4,ph:7.13,t:20.8,tu:4.5,d:7.7},{s:4,ph:7.24,t:23.4,tu:3.8,d:8.5},{s:4,ph:6.95,t:21.0,tu:4.4,d:6.6},{s:4,ph:7.33,t:22.5,tu:3.6,d:9.3},{s:4,ph:7.07,t:20.5,tu:4.8,d:7.4},{s:4,ph:7.16,t:23.1,tu:3.9,d:8.8},
    {s:4,ph:7.28,t:21.3,tu:4.1,d:7.2},{s:4,ph:7.00,t:22.9,tu:3.5,d:9.5},{s:4,ph:6.93,t:20.2,tu:4.9,d:6.0},{s:4,ph:7.44,t:23.5,tu:3.1,d:9.9},{s:4,ph:7.11,t:21.6,tu:4.4,d:7.6},{s:4,ph:7.21,t:22.1,tu:3.7,d:8.3},{s:4,ph:6.98,t:20.9,tu:4.2,d:6.8},{s:4,ph:7.36,t:23.2,tu:3.4,d:9.1},{s:4,ph:7.07,t:21.4,tu:4.6,d:7.2},{s:4,ph:7.15,t:22.7,tu:3.8,d:8.1},
    {s:4,ph:7.26,t:20.5,tu:4.2,d:9.6},{s:4,ph:7.05,t:23.1,tu:3.6,d:7.9},{s:4,ph:6.90,t:21.8,tu:4.7,d:6.4},{s:4,ph:7.41,t:22.3,tu:3.3,d:9.3},{s:4,ph:7.14,t:20.9,tu:4.4,d:7.7},{s:4,ph:7.23,t:23.4,tu:3.8,d:8.5},{s:4,ph:6.94,t:21.1,tu:4.5,d:6.6},{s:4,ph:7.32,t:22.5,tu:3.7,d:9.4},{s:4,ph:7.08,t:20.5,tu:4.7,d:7.4},{s:4,ph:7.17,t:23.2,tu:4.0,d:8.7},
    {s:4,ph:7.27,t:21.4,tu:4.1,d:7.1},{s:4,ph:7.02,t:22.8,tu:3.5,d:9.5},{s:4,ph:6.92,t:20.3,tu:4.9,d:6.0},{s:4,ph:7.43,t:23.5,tu:3.1,d:9.9},{s:4,ph:7.11,t:21.6,tu:4.4,d:7.6},{s:4,ph:7.19,t:22.2,tu:3.8,d:8.3},{s:4,ph:6.97,t:20.8,tu:4.2,d:6.8},{s:4,ph:7.35,t:23.3,tu:3.5,d:9.1},{s:4,ph:7.05,t:21.1,tu:4.7,d:7.2},{s:4,ph:7.14,t:22.7,tu:3.8,d:8.1},
  ];

  console.log('\n🌱 Starting seed...');

  const createdUsers = [];
  for (const u of USERS) {
    const [user, created] = await User.findOrCreate({
      where: { email: u.email },
      defaults: { username: u.username, email: u.email, password: u.password, full_name: u.full_name, organization_type: u.organization_type }
    });
    createdUsers.push(user);
    console.log(`  ${created ? '✅' : '⚠️ '} User: ${u.full_name}`);
  }

  const createdSensors = [];
  for (const s of SENSORS) {
    const user = createdUsers[s.idx];
    let sensor = await Sensor.findOne({ where: { sensor_name: s.sensor_name } });
    if (!sensor) {
      const rawKey = `AQ-${crypto.randomBytes(32).toString('hex')}`;
      const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
      sensor = await Sensor.create({ sensor_name: s.sensor_name, location: s.location, api_key: rawKey, api_key_hash: hash, userId: user.id });
      console.log(`  ✅ Sensor: ${s.sensor_name} | Key: ${rawKey}`);
    } else {
      console.log(`  ⚠️  Sensor exists: ${s.sensor_name} | Key: ${sensor.api_key}`);
    }
    createdSensors.push(sensor);
  }

  const existing = await Reading.count();
  if (existing > 0) {
    console.log(`  ⚠️  Skipping readings - ${existing} already exist`);
  } else {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    let alerts = 0;
    for (const r of READINGS) {
      const sensor = createdSensors[r.s];
      const { risk_level, reasons } = calculateRiskLevel(r.ph, r.tu, r.d, r.t);
      const ai_explanation = generateExplanation(r.ph, r.tu, r.d, risk_level, USERS[r.s].organization_type);
      const ts = new Date(now - Math.random() * thirtyDays);
      const reading = await Reading.create({ sensorId: sensor.id, ph: r.ph, turbidity: r.tu, temperature: r.t, tds: 220, dissolved_oxygen: r.d, risk_level, ai_explanation, createdAt: ts, updatedAt: ts });
      if (shouldTriggerAlert(r.ph, r.tu, r.d)) {
        await Alert.create({ ReadingId: reading.id, severity: risk_level === 'CRITICAL' ? 'CRITICAL' : 'WARNING', message: `Issue on "${sensor.sensor_name}". Risk: ${risk_level}. ${reasons.join('. ')}`, createdAt: ts, updatedAt: ts });
        alerts++;
      }
    }
    console.log(`  ✅ Created 500 readings + ${alerts} alerts`);
  }

  console.log('\n✅ SEED DONE! All passwords: Aqua@1234\n');
}

module.exports = runSeed;