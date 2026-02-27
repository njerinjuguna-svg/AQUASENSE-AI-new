const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const USERS = [
  { username: 'greenfield_admin',  email: 'greenfield@aquasense.com',  full_name: 'GreenField Pharmaceuticals',  organization_type: 'pharmaceutical', password: 'Aqua@1234' },
  { username: 'bluewater_admin',   email: 'bluewater@aquasense.com',   full_name: 'BlueWater Processing Ltd',    organization_type: 'food',           password: 'Aqua@1234' },
  { username: 'riverfresh_admin',  email: 'riverfresh@aquasense.com',  full_name: 'RiverFresh Aquaculture',      organization_type: 'aquaculture',    password: 'Aqua@1234' },
  { username: 'cityschool_admin',  email: 'cityschool@aquasense.com',  full_name: 'City Central School',         organization_type: 'school',         password: 'Aqua@1234' },
  { username: 'sunrise_admin',     email: 'sunrise@aquasense.com',     full_name: 'Sunrise Bottling Company',    organization_type: 'food',           password: 'Aqua@1234' },
];

const SENSORS = [
  { userIndex: 0, sensor_name: 'GreenField Primary Sensor',   location: 'Lagos Industrial Zone' },
  { userIndex: 1, sensor_name: 'BlueWater Main Monitor',      location: 'Abuja Treatment Facility' },
  { userIndex: 2, sensor_name: 'RiverFresh Water Probe',      location: 'Port Harcourt' },
  { userIndex: 3, sensor_name: 'City School Borehole Sensor', location: 'Abuja' },
  { userIndex: 4, sensor_name: 'Sunrise Bottling Sensor',     location: 'Lagos' },
];

// 500 readings (100 per sensor) from Water_Management_Data.csv
const RAW_READINGS = [
  {s:0,ph:7.25,temp:23.1,turb:4.5,do:7.8,cond:342},{s:0,ph:7.11,temp:22.3,turb:5.1,do:6.2,cond:335},{s:0,ph:7.03,temp:21.5,turb:3.9,do:8.3,cond:356},{s:0,ph:7.38,temp:22.9,turb:3.2,do:9.5,cond:327},{s:0,ph:7.45,temp:20.7,turb:3.8,do:8.1,cond:352},{s:0,ph:6.89,temp:23.6,turb:4.6,do:7.2,cond:320},{s:0,ph:7.19,temp:21.2,turb:4.2,do:8.8,cond:350},{s:0,ph:6.98,temp:22.1,turb:3.7,do:6.9,cond:325},{s:0,ph:7.31,temp:20.4,turb:4.1,do:8.4,cond:360},{s:0,ph:7.02,temp:22.7,turb:4.8,do:7.5,cond:330},
  {s:0,ph:7.24,temp:22.4,turb:4.3,do:8.6,cond:347},{s:0,ph:7.17,temp:21.6,turb:3.6,do:7.1,cond:328},{s:0,ph:6.95,temp:22.3,turb:4.1,do:6.4,cond:341},{s:0,ph:7.06,temp:23.5,turb:3.7,do:9.2,cond:355},{s:0,ph:7.48,temp:20.8,turb:3.4,do:7.9,cond:329},{s:0,ph:6.92,temp:21.4,turb:4.9,do:6.8,cond:362},{s:0,ph:7.11,temp:22.0,turb:4.4,do:8.1,cond:336},{s:0,ph:7.30,temp:23.2,turb:3.5,do:9.6,cond:351},{s:0,ph:7.13,temp:21.1,turb:4.0,do:7.5,cond:319},{s:0,ph:7.01,temp:23.0,turb:4.7,do:8.9,cond:330},
  {s:0,ph:7.22,temp:21.8,turb:3.8,do:7.3,cond:344},{s:0,ph:7.09,temp:22.5,turb:4.5,do:8.7,cond:337},{s:0,ph:6.97,temp:20.9,turb:3.3,do:6.5,cond:358},{s:0,ph:7.35,temp:23.4,turb:4.0,do:9.1,cond:323},{s:0,ph:7.14,temp:21.3,turb:4.6,do:7.8,cond:349},{s:0,ph:7.28,temp:22.8,turb:3.9,do:8.4,cond:332},{s:0,ph:6.93,temp:20.5,turb:4.2,do:7.0,cond:365},{s:0,ph:7.40,temp:23.1,turb:3.6,do:9.3,cond:326},{s:0,ph:7.07,temp:21.7,turb:4.8,do:6.7,cond:343},{s:0,ph:7.18,temp:22.6,turb:3.4,do:8.2,cond:354},
  {s:0,ph:7.26,temp:20.6,turb:4.1,do:7.6,cond:331},{s:0,ph:7.04,temp:23.3,turb:4.7,do:9.4,cond:348},{s:0,ph:6.96,temp:21.9,turb:3.5,do:6.3,cond:339},{s:0,ph:7.33,temp:22.2,turb:4.3,do:8.8,cond:357},{s:0,ph:7.10,temp:20.3,turb:3.8,do:7.4,cond:324},{s:0,ph:7.21,temp:23.5,turb:4.5,do:9.0,cond:346},{s:0,ph:6.94,temp:21.0,turb:3.7,do:6.6,cond:363},{s:0,ph:7.37,temp:22.4,turb:4.0,do:8.5,cond:330},{s:0,ph:7.08,temp:20.8,turb:4.6,do:7.2,cond:352},{s:0,ph:7.16,temp:23.0,turb:3.3,do:9.7,cond:320},
  {s:0,ph:7.29,temp:21.5,turb:4.4,do:7.9,cond:345},{s:0,ph:7.00,temp:22.7,turb:3.6,do:8.1,cond:335},{s:0,ph:6.91,temp:20.4,turb:4.9,do:6.9,cond:360},{s:0,ph:7.42,temp:23.2,turb:3.2,do:9.5,cond:327},{s:0,ph:7.12,temp:21.6,turb:4.7,do:7.7,cond:350},{s:0,ph:7.23,temp:22.1,turb:3.9,do:8.6,cond:338},{s:0,ph:6.99,temp:20.7,turb:4.3,do:6.4,cond:355},{s:0,ph:7.34,temp:23.4,turb:3.5,do:9.2,cond:322},{s:0,ph:7.05,temp:21.2,turb:4.8,do:7.1,cond:347},{s:0,ph:7.20,temp:22.9,turb:3.7,do:8.3,cond:333},
  {s:0,ph:7.27,temp:20.5,turb:4.2,do:9.8,cond:362},{s:0,ph:7.03,temp:23.1,turb:3.8,do:7.0,cond:329},{s:0,ph:6.88,temp:21.8,turb:4.6,do:6.7,cond:344},{s:0,ph:7.41,temp:22.3,turb:3.4,do:9.1,cond:356},{s:0,ph:7.15,temp:20.9,turb:4.1,do:7.5,cond:331},{s:0,ph:7.25,temp:23.6,turb:3.7,do:8.9,cond:348},{s:0,ph:6.95,temp:21.3,turb:4.8,do:6.2,cond:337},{s:0,ph:7.36,temp:22.7,turb:3.3,do:9.6,cond:353},{s:0,ph:7.09,temp:20.6,turb:4.5,do:7.8,cond:326},{s:0,ph:7.18,temp:23.2,turb:3.9,do:8.4,cond:342},
  {s:0,ph:7.32,temp:21.4,turb:4.3,do:7.3,cond:359},{s:0,ph:7.01,temp:22.8,turb:3.6,do:9.0,cond:334},{s:0,ph:6.93,temp:20.3,turb:4.7,do:6.5,cond:367},{s:0,ph:7.44,temp:23.5,turb:3.1,do:9.9,cond:321},{s:0,ph:7.11,temp:21.7,turb:4.4,do:7.6,cond:346},{s:0,ph:7.22,temp:22.2,turb:3.8,do:8.7,cond:332},{s:0,ph:6.97,temp:20.8,turb:4.2,do:6.8,cond:358},{s:0,ph:7.38,temp:23.3,turb:3.5,do:9.3,cond:323},{s:0,ph:7.06,temp:21.1,turb:4.9,do:7.2,cond:348},{s:0,ph:7.19,temp:22.6,turb:3.7,do:8.1,cond:336},
  {s:0,ph:7.30,temp:20.4,turb:4.0,do:9.5,cond:363},{s:0,ph:7.04,temp:23.0,turb:3.4,do:7.9,cond:330},{s:0,ph:6.90,temp:21.6,turb:4.6,do:6.3,cond:345},{s:0,ph:7.39,temp:22.4,turb:3.2,do:9.2,cond:357},{s:0,ph:7.13,temp:20.7,turb:4.5,do:7.7,cond:328},{s:0,ph:7.24,temp:23.4,turb:3.8,do:8.5,cond:350},{s:0,ph:6.96,temp:21.0,turb:4.4,do:6.6,cond:340},{s:0,ph:7.35,temp:22.5,turb:3.6,do:9.4,cond:355},{s:0,ph:7.08,temp:20.5,turb:4.7,do:7.4,cond:324},{s:0,ph:7.17,temp:23.1,turb:3.9,do:8.8,cond:341},
  {s:0,ph:7.28,temp:21.3,turb:4.1,do:7.1,cond:352},{s:0,ph:7.02,temp:22.9,turb:3.5,do:9.7,cond:331},{s:0,ph:6.92,temp:20.2,turb:4.8,do:6.0,cond:365},{s:0,ph:7.43,temp:23.6,turb:3.3,do:9.8,cond:319},{s:0,ph:7.10,temp:21.5,turb:4.3,do:7.5,cond:347},{s:0,ph:7.21,temp:22.1,turb:3.7,do:8.2,cond:333},{s:0,ph:6.98,temp:20.9,turb:4.5,do:6.7,cond:356},{s:0,ph:7.37,temp:23.2,turb:3.4,do:9.0,cond:325},{s:0,ph:7.07,temp:21.4,turb:4.6,do:7.3,cond:344},{s:0,ph:7.16,temp:22.7,turb:3.8,do:8.6,cond:337},

  {s:1,ph:7.20,temp:22.5,turb:4.4,do:8.0,cond:340},{s:1,ph:7.08,temp:21.3,turb:3.8,do:7.5,cond:332},{s:1,ph:6.98,temp:22.8,turb:4.1,do:6.8,cond:348},{s:1,ph:7.35,temp:20.6,turb:3.5,do:9.3,cond:325},{s:1,ph:7.12,temp:23.1,turb:4.7,do:7.9,cond:353},{s:1,ph:7.28,temp:21.7,turb:3.9,do:8.5,cond:338},{s:1,ph:6.95,temp:22.4,turb:4.3,do:6.5,cond:360},{s:1,ph:7.40,temp:20.3,turb:3.6,do:9.0,cond:328},{s:1,ph:7.06,temp:23.5,turb:4.8,do:7.2,cond:345},{s:1,ph:7.18,temp:21.9,turb:3.7,do:8.8,cond:335},
  {s:1,ph:7.25,temp:22.2,turb:4.2,do:7.6,cond:342},{s:1,ph:7.11,temp:20.8,turb:3.4,do:9.1,cond:357},{s:1,ph:6.97,temp:23.3,turb:4.6,do:6.3,cond:336},{s:1,ph:7.33,temp:21.5,turb:3.8,do:8.7,cond:350},{s:1,ph:7.15,temp:22.0,turb:4.0,do:7.8,cond:327},{s:1,ph:7.22,temp:23.6,turb:3.5,do:9.4,cond:348},{s:1,ph:6.93,temp:20.4,turb:4.5,do:6.9,cond:363},{s:1,ph:7.38,temp:22.7,turb:3.2,do:9.2,cond:322},{s:1,ph:7.09,temp:21.2,turb:4.7,do:7.4,cond:346},{s:1,ph:7.20,temp:23.0,turb:3.9,do:8.3,cond:331},
  {s:1,ph:7.27,temp:21.6,turb:4.3,do:7.7,cond:355},{s:1,ph:7.03,temp:22.4,turb:3.6,do:9.6,cond:330},{s:1,ph:6.91,temp:20.7,turb:4.8,do:6.6,cond:360},{s:1,ph:7.42,temp:23.2,turb:3.3,do:9.1,cond:324},{s:1,ph:7.14,temp:21.1,turb:4.5,do:7.9,cond:349},{s:1,ph:7.24,temp:22.6,turb:3.7,do:8.4,cond:338},{s:1,ph:6.99,temp:20.5,turb:4.2,do:6.7,cond:356},{s:1,ph:7.36,temp:23.4,turb:3.5,do:9.5,cond:320},{s:1,ph:7.05,temp:21.8,turb:4.6,do:7.1,cond:345},{s:1,ph:7.17,temp:22.9,turb:3.8,do:8.6,cond:334},
  {s:1,ph:7.29,temp:20.6,turb:4.1,do:9.7,cond:361},{s:1,ph:7.04,temp:23.1,turb:3.7,do:7.3,cond:327},{s:1,ph:6.89,temp:21.4,turb:4.9,do:6.4,cond:344},{s:1,ph:7.41,temp:22.3,turb:3.4,do:9.2,cond:358},{s:1,ph:7.13,temp:20.9,turb:4.4,do:7.8,cond:333},{s:1,ph:7.23,temp:23.5,turb:3.6,do:8.9,cond:347},{s:1,ph:6.96,temp:21.3,turb:4.7,do:6.2,cond:340},{s:1,ph:7.37,temp:22.7,turb:3.3,do:9.8,cond:354},{s:1,ph:7.08,temp:20.8,turb:4.5,do:7.5,cond:328},{s:1,ph:7.19,temp:23.2,turb:3.9,do:8.2,cond:343},
  {s:1,ph:7.31,temp:21.5,turb:4.0,do:7.0,cond:352},{s:1,ph:7.02,temp:22.8,turb:3.5,do:9.3,cond:335},{s:1,ph:6.94,temp:20.3,turb:4.6,do:6.8,cond:366},{s:1,ph:7.44,temp:23.5,turb:3.2,do:9.9,cond:319},{s:1,ph:7.10,temp:21.7,turb:4.3,do:7.6,cond:348},{s:1,ph:7.21,temp:22.2,turb:3.8,do:8.7,cond:332},{s:1,ph:6.98,temp:20.8,turb:4.2,do:6.5,cond:359},{s:1,ph:7.38,temp:23.3,turb:3.5,do:9.0,cond:323},{s:1,ph:7.06,temp:21.1,turb:4.8,do:7.3,cond:347},{s:1,ph:7.16,temp:22.6,turb:3.7,do:8.1,cond:337},
  {s:1,ph:7.26,temp:20.4,turb:4.1,do:9.5,cond:362},{s:1,ph:7.03,temp:23.0,turb:3.4,do:7.8,cond:331},{s:1,ph:6.88,temp:21.6,turb:4.6,do:6.3,cond:346},{s:1,ph:7.39,temp:22.4,turb:3.2,do:9.1,cond:357},{s:1,ph:7.12,temp:20.7,turb:4.5,do:7.7,cond:329},{s:1,ph:7.25,temp:23.4,turb:3.8,do:8.5,cond:350},{s:1,ph:6.95,temp:21.0,turb:4.4,do:6.6,cond:341},{s:1,ph:7.35,temp:22.5,turb:3.6,do:9.4,cond:355},{s:1,ph:7.07,temp:20.5,turb:4.7,do:7.4,cond:325},{s:1,ph:7.18,temp:23.1,turb:3.9,do:8.8,cond:342},
  {s:1,ph:7.28,temp:21.3,turb:4.1,do:7.2,cond:352},{s:1,ph:7.01,temp:22.9,turb:3.5,do:9.7,cond:330},{s:1,ph:6.92,temp:20.2,turb:4.8,do:6.1,cond:364},{s:1,ph:7.43,temp:23.6,turb:3.3,do:9.8,cond:320},{s:1,ph:7.11,temp:21.5,turb:4.3,do:7.5,cond:348},{s:1,ph:7.22,temp:22.1,turb:3.7,do:8.2,cond:334},{s:1,ph:6.97,temp:20.9,turb:4.5,do:6.7,cond:357},{s:1,ph:7.36,temp:23.2,turb:3.4,do:9.0,cond:326},{s:1,ph:7.08,temp:21.4,turb:4.6,do:7.3,cond:344},{s:1,ph:7.15,temp:22.7,turb:3.8,do:8.6,cond:338},
  {s:1,ph:7.30,temp:20.6,turb:4.2,do:9.6,cond:360},{s:1,ph:7.05,temp:23.1,turb:3.6,do:7.9,cond:328},{s:1,ph:6.90,temp:21.8,turb:4.7,do:6.4,cond:343},{s:1,ph:7.40,temp:22.3,turb:3.3,do:9.2,cond:356},{s:1,ph:7.14,temp:20.9,turb:4.4,do:7.7,cond:332},{s:1,ph:7.23,temp:23.4,turb:3.8,do:8.5,cond:349},{s:1,ph:6.96,temp:21.1,turb:4.5,do:6.6,cond:340},{s:1,ph:7.34,temp:22.5,turb:3.6,do:9.3,cond:354},{s:1,ph:7.09,temp:20.5,turb:4.7,do:7.4,cond:326},{s:1,ph:7.17,temp:23.2,turb:4.0,do:8.7,cond:341},
  {s:1,ph:7.27,temp:21.4,turb:4.1,do:7.1,cond:351},{s:1,ph:7.02,temp:22.8,turb:3.5,do:9.5,cond:333},{s:1,ph:6.93,temp:20.3,turb:4.9,do:6.0,cond:364},{s:1,ph:7.44,temp:23.5,turb:3.1,do:9.9,cond:318},{s:1,ph:7.11,temp:21.6,turb:4.4,do:7.6,cond:347},{s:1,ph:7.20,temp:22.2,turb:3.8,do:8.3,cond:335},{s:1,ph:6.99,temp:20.8,turb:4.2,do:6.8,cond:358},{s:1,ph:7.37,temp:23.3,turb:3.5,do:9.1,cond:324},{s:1,ph:7.07,temp:21.1,turb:4.6,do:7.2,cond:345},{s:1,ph:7.16,temp:22.7,turb:3.8,do:8.1,cond:336},
  {s:1,ph:7.26,temp:23.1,turb:3.9,do:9.2,cond:360},{s:1,ph:7.03,temp:22.0,turb:4.2,do:7.6,cond:330},{s:1,ph:7.15,temp:23.2,turb:3.6,do:8.9,cond:353},{s:1,ph:7.19,temp:21.4,turb:4.3,do:7.8,cond:336},{s:1,ph:7.11,temp:22.7,turb:4.5,do:8.3,cond:347},{s:1,ph:7.01,temp:20.8,turb:4.6,do:7.1,cond:327},{s:1,ph:7.31,temp:22.5,turb:3.8,do:9.4,cond:361},{s:1,ph:7.02,temp:21.2,turb:4.7,do:7.5,cond:334},{s:1,ph:7.25,temp:23.0,turb:3.9,do:8.7,cond:359},{s:1,ph:7.12,temp:20.9,turb:4.4,do:8.2,cond:339},

  {s:2,ph:7.18,temp:23.0,turb:4.6,do:8.5,cond:343},{s:2,ph:7.05,temp:21.8,turb:3.9,do:7.0,cond:330},{s:2,ph:6.95,temp:22.5,turb:4.3,do:6.6,cond:355},{s:2,ph:7.32,temp:20.7,turb:3.6,do:9.2,cond:326},{s:2,ph:7.08,temp:23.2,turb:4.8,do:7.8,cond:351},{s:2,ph:7.25,temp:21.4,turb:3.8,do:8.6,cond:340},{s:2,ph:6.92,temp:22.1,turb:4.4,do:6.3,cond:362},{s:2,ph:7.38,temp:20.5,turb:3.5,do:9.5,cond:325},{s:2,ph:7.03,temp:23.4,turb:4.9,do:7.1,cond:347},{s:2,ph:7.15,temp:21.6,turb:3.7,do:8.9,cond:336},
  {s:2,ph:7.22,temp:22.3,turb:4.2,do:7.7,cond:344},{s:2,ph:7.09,temp:20.9,turb:3.4,do:9.0,cond:358},{s:2,ph:6.94,temp:23.1,turb:4.7,do:6.4,cond:337},{s:2,ph:7.30,temp:21.3,turb:3.9,do:8.8,cond:351},{s:2,ph:7.12,temp:22.0,turb:4.1,do:7.9,cond:328},{s:2,ph:7.20,temp:23.5,turb:3.6,do:9.3,cond:349},{s:2,ph:6.90,temp:20.2,turb:4.6,do:6.7,cond:365},{s:2,ph:7.35,temp:22.6,turb:3.3,do:9.1,cond:323},{s:2,ph:7.06,temp:21.0,turb:4.8,do:7.3,cond:347},{s:2,ph:7.17,temp:23.2,turb:3.8,do:8.4,cond:332},
  {s:2,ph:7.24,temp:21.7,turb:4.4,do:7.6,cond:353},{s:2,ph:7.01,temp:22.4,turb:3.7,do:9.5,cond:331},{s:2,ph:6.89,temp:20.8,turb:4.9,do:6.5,cond:361},{s:2,ph:7.40,temp:23.3,turb:3.2,do:9.0,cond:322},{s:2,ph:7.11,temp:21.2,turb:4.6,do:7.8,cond:349},{s:2,ph:7.21,temp:22.7,turb:3.8,do:8.3,cond:337},{s:2,ph:6.97,temp:20.6,turb:4.2,do:6.8,cond:357},{s:2,ph:7.34,temp:23.4,turb:3.6,do:9.4,cond:319},{s:2,ph:7.04,temp:21.9,turb:4.7,do:7.0,cond:346},{s:2,ph:7.14,temp:22.8,turb:3.9,do:8.7,cond:333},
  {s:2,ph:7.27,temp:20.5,turb:4.0,do:9.8,cond:363},{s:2,ph:7.02,temp:23.1,turb:3.5,do:7.4,cond:328},{s:2,ph:6.87,temp:21.4,turb:4.8,do:6.2,cond:345},{s:2,ph:7.39,temp:22.2,turb:3.4,do:9.3,cond:355},{s:2,ph:7.10,temp:20.7,turb:4.5,do:7.7,cond:330},{s:2,ph:7.22,temp:23.5,turb:3.7,do:8.6,cond:348},{s:2,ph:6.93,temp:21.1,turb:4.4,do:6.5,cond:341},{s:2,ph:7.36,temp:22.4,turb:3.3,do:9.7,cond:352},{s:2,ph:7.05,temp:20.6,turb:4.6,do:7.2,cond:327},{s:2,ph:7.16,temp:23.2,turb:3.9,do:8.1,cond:343},
  {s:2,ph:7.29,temp:21.3,turb:4.3,do:7.5,cond:354},{s:2,ph:7.00,temp:22.9,turb:3.6,do:9.2,cond:334},{s:2,ph:6.91,temp:20.4,turb:4.7,do:6.8,cond:367},{s:2,ph:7.42,temp:23.6,turb:3.1,do:9.9,cond:318},{s:2,ph:7.08,temp:21.8,turb:4.4,do:7.6,cond:346},{s:2,ph:7.19,temp:22.1,turb:3.8,do:8.7,cond:331},{s:2,ph:6.96,temp:20.9,turb:4.3,do:6.4,cond:359},{s:2,ph:7.37,temp:23.3,turb:3.4,do:9.0,cond:324},{s:2,ph:7.07,temp:21.2,turb:4.9,do:7.1,cond:349},{s:2,ph:7.18,temp:22.7,turb:3.7,do:8.2,cond:337},
  {s:2,ph:7.26,temp:20.4,turb:4.2,do:9.6,cond:361},{s:2,ph:7.04,temp:23.0,turb:3.5,do:7.8,cond:329},{s:2,ph:6.88,temp:21.7,turb:4.7,do:6.3,cond:345},{s:2,ph:7.38,temp:22.3,turb:3.3,do:9.1,cond:357},{s:2,ph:7.13,temp:20.8,turb:4.5,do:7.7,cond:330},{s:2,ph:7.23,temp:23.4,turb:3.8,do:8.5,cond:350},{s:2,ph:6.94,temp:21.0,turb:4.4,do:6.6,cond:341},{s:2,ph:7.33,temp:22.5,turb:3.7,do:9.3,cond:354},{s:2,ph:7.06,temp:20.5,turb:4.8,do:7.4,cond:325},{s:2,ph:7.15,temp:23.1,turb:3.9,do:8.8,cond:342},
  {s:2,ph:7.28,temp:21.4,turb:4.1,do:7.2,cond:352},{s:2,ph:7.00,temp:22.8,turb:3.6,do:9.5,cond:331},{s:2,ph:6.93,temp:20.2,turb:4.8,do:6.1,cond:363},{s:2,ph:7.43,temp:23.5,turb:3.2,do:9.8,cond:320},{s:2,ph:7.10,temp:21.6,turb:4.4,do:7.6,cond:347},{s:2,ph:7.21,temp:22.1,turb:3.7,do:8.3,cond:334},{s:2,ph:6.97,temp:20.9,turb:4.5,do:6.7,cond:356},{s:2,ph:7.35,temp:23.2,turb:3.4,do:9.2,cond:326},{s:2,ph:7.07,temp:21.4,turb:4.6,do:7.3,cond:345},{s:2,ph:7.16,temp:22.6,turb:3.8,do:8.6,cond:338},
  {s:2,ph:7.31,temp:20.6,turb:4.2,do:9.6,cond:360},{s:2,ph:7.05,temp:23.1,turb:3.6,do:7.9,cond:328},{s:2,ph:6.90,temp:21.8,turb:4.7,do:6.4,cond:344},{s:2,ph:7.40,temp:22.3,turb:3.3,do:9.3,cond:355},{s:2,ph:7.14,temp:20.9,turb:4.4,do:7.7,cond:333},{s:2,ph:7.24,temp:23.4,turb:3.8,do:8.5,cond:349},{s:2,ph:6.95,temp:21.1,turb:4.5,do:6.6,cond:340},{s:2,ph:7.33,temp:22.5,turb:3.7,do:9.4,cond:353},{s:2,ph:7.08,temp:20.5,turb:4.7,do:7.4,cond:327},{s:2,ph:7.17,temp:23.2,turb:4.0,do:8.7,cond:342},
  {s:2,ph:7.27,temp:21.4,turb:4.1,do:7.1,cond:350},{s:2,ph:7.02,temp:22.8,turb:3.5,do:9.5,cond:332},{s:2,ph:6.93,temp:20.3,turb:4.9,do:6.0,cond:364},{s:2,ph:7.44,temp:23.5,turb:3.1,do:9.9,cond:317},{s:2,ph:7.12,temp:21.6,turb:4.4,do:7.6,cond:346},{s:2,ph:7.20,temp:22.2,turb:3.8,do:8.3,cond:334},{s:2,ph:6.98,temp:20.8,turb:4.2,do:6.8,cond:357},{s:2,ph:7.36,temp:23.3,turb:3.5,do:9.1,cond:323},{s:2,ph:7.06,temp:21.1,turb:4.7,do:7.2,cond:344},{s:2,ph:7.15,temp:22.7,turb:3.8,do:8.1,cond:336},
  {s:2,ph:7.25,temp:23.1,turb:3.9,do:9.2,cond:359},{s:2,ph:7.03,temp:22.0,turb:4.2,do:7.6,cond:329},{s:2,ph:7.14,temp:23.2,turb:3.6,do:8.9,cond:352},{s:2,ph:7.18,temp:21.4,turb:4.3,do:7.8,cond:336},{s:2,ph:7.10,temp:22.7,turb:4.5,do:8.3,cond:346},{s:2,ph:7.00,temp:20.8,turb:4.6,do:7.1,cond:326},{s:2,ph:7.30,temp:22.5,turb:3.8,do:9.4,cond:360},{s:2,ph:7.01,temp:21.2,turb:4.7,do:7.5,cond:333},{s:2,ph:7.24,temp:23.0,turb:3.9,do:8.7,cond:358},{s:2,ph:7.11,temp:20.9,turb:4.4,do:8.2,cond:338},

  {s:3,ph:7.15,temp:22.8,turb:4.5,do:8.2,cond:341},{s:3,ph:7.02,temp:21.5,turb:3.8,do:7.3,cond:333},{s:3,ph:6.96,temp:22.7,turb:4.2,do:6.7,cond:350},{s:3,ph:7.33,temp:20.5,turb:3.5,do:9.4,cond:324},{s:3,ph:7.10,temp:23.0,turb:4.7,do:7.7,cond:354},{s:3,ph:7.26,temp:21.6,turb:3.9,do:8.7,cond:337},{s:3,ph:6.93,temp:22.3,turb:4.3,do:6.4,cond:361},{s:3,ph:7.41,temp:20.4,turb:3.6,do:9.2,cond:327},{s:3,ph:7.04,temp:23.3,turb:4.8,do:7.0,cond:346},{s:3,ph:7.16,temp:21.8,turb:3.7,do:8.6,cond:334},
  {s:3,ph:7.23,temp:22.1,turb:4.1,do:7.5,cond:343},{s:3,ph:7.07,temp:20.7,turb:3.4,do:9.1,cond:358},{s:3,ph:6.95,temp:23.2,turb:4.6,do:6.5,cond:338},{s:3,ph:7.31,temp:21.4,turb:3.8,do:8.9,cond:352},{s:3,ph:7.13,temp:22.0,turb:4.0,do:7.6,cond:328},{s:3,ph:7.21,temp:23.4,turb:3.5,do:9.5,cond:349},{s:3,ph:6.91,temp:20.3,turb:4.5,do:6.8,cond:364},{s:3,ph:7.36,temp:22.6,turb:3.2,do:9.3,cond:321},{s:3,ph:7.08,temp:21.1,turb:4.7,do:7.2,cond:348},{s:3,ph:7.18,temp:23.1,turb:3.8,do:8.1,cond:332},
  {s:3,ph:7.25,temp:21.6,turb:4.3,do:7.8,cond:355},{s:3,ph:7.04,temp:22.3,turb:3.6,do:9.7,cond:330},{s:3,ph:6.90,temp:20.6,turb:4.9,do:6.6,cond:362},{s:3,ph:7.43,temp:23.2,turb:3.3,do:9.0,cond:322},{s:3,ph:7.12,temp:21.3,turb:4.6,do:7.9,cond:350},{s:3,ph:7.22,temp:22.8,turb:3.7,do:8.4,cond:338},{s:3,ph:6.98,temp:20.4,turb:4.2,do:6.6,cond:358},{s:3,ph:7.35,temp:23.4,turb:3.5,do:9.6,cond:319},{s:3,ph:7.06,temp:21.7,turb:4.7,do:7.0,cond:347},{s:3,ph:7.15,temp:22.9,turb:3.8,do:8.5,cond:335},
  {s:3,ph:7.28,temp:20.7,turb:4.0,do:9.8,cond:360},{s:3,ph:7.03,temp:23.0,turb:3.6,do:7.5,cond:326},{s:3,ph:6.88,temp:21.3,turb:4.8,do:6.3,cond:344},{s:3,ph:7.40,temp:22.2,turb:3.4,do:9.3,cond:357},{s:3,ph:7.11,temp:20.8,turb:4.5,do:7.8,cond:332},{s:3,ph:7.24,temp:23.5,turb:3.6,do:8.8,cond:347},{s:3,ph:6.94,temp:21.2,turb:4.4,do:6.5,cond:342},{s:3,ph:7.38,temp:22.4,turb:3.3,do:9.7,cond:353},{s:3,ph:7.07,temp:20.5,turb:4.6,do:7.3,cond:326},{s:3,ph:7.17,temp:23.1,turb:3.9,do:8.0,cond:344},
  {s:3,ph:7.30,temp:21.2,turb:4.2,do:7.6,cond:353},{s:3,ph:7.01,temp:22.7,turb:3.6,do:9.3,cond:334},{s:3,ph:6.93,temp:20.3,turb:4.7,do:6.7,cond:366},{s:3,ph:7.45,temp:23.5,turb:3.1,do:9.9,cond:318},{s:3,ph:7.09,temp:21.6,turb:4.4,do:7.5,cond:349},{s:3,ph:7.20,temp:22.1,turb:3.8,do:8.6,cond:332},{s:3,ph:6.97,temp:20.7,turb:4.3,do:6.5,cond:360},{s:3,ph:7.37,temp:23.2,turb:3.4,do:9.1,cond:323},{s:3,ph:7.05,temp:21.1,turb:4.8,do:7.2,cond:346},{s:3,ph:7.14,temp:22.6,turb:3.7,do:8.1,cond:338},
  {s:3,ph:7.27,temp:20.5,turb:4.1,do:9.5,cond:362},{s:3,ph:7.04,temp:23.0,turb:3.4,do:7.9,cond:330},{s:3,ph:6.89,temp:21.7,turb:4.6,do:6.3,cond:347},{s:3,ph:7.39,temp:22.4,turb:3.3,do:9.2,cond:356},{s:3,ph:7.13,temp:20.8,turb:4.5,do:7.7,cond:330},{s:3,ph:7.25,temp:23.3,turb:3.8,do:8.4,cond:351},{s:3,ph:6.96,temp:21.0,turb:4.4,do:6.6,cond:340},{s:3,ph:7.34,temp:22.5,turb:3.7,do:9.4,cond:354},{s:3,ph:7.08,temp:20.4,turb:4.7,do:7.4,cond:325},{s:3,ph:7.16,temp:23.1,turb:3.9,do:8.9,cond:343},
  {s:3,ph:7.29,temp:21.3,turb:4.1,do:7.1,cond:352},{s:3,ph:7.01,temp:22.9,turb:3.5,do:9.6,cond:330},{s:3,ph:6.92,temp:20.2,turb:4.9,do:6.0,cond:365},{s:3,ph:7.44,temp:23.6,turb:3.2,do:9.8,cond:320},{s:3,ph:7.10,temp:21.5,turb:4.4,do:7.5,cond:347},{s:3,ph:7.22,temp:22.1,turb:3.7,do:8.3,cond:334},{s:3,ph:6.97,temp:20.9,turb:4.5,do:6.7,cond:357},{s:3,ph:7.36,temp:23.2,turb:3.4,do:9.0,cond:325},{s:3,ph:7.07,temp:21.4,turb:4.6,do:7.3,cond:344},{s:3,ph:7.15,temp:22.7,turb:3.8,do:8.7,cond:338},
  {s:3,ph:7.31,temp:20.7,turb:4.2,do:9.6,cond:360},{s:3,ph:7.05,temp:23.1,turb:3.6,do:7.9,cond:328},{s:3,ph:6.90,temp:21.8,turb:4.7,do:6.4,cond:344},{s:3,ph:7.41,temp:22.3,turb:3.3,do:9.2,cond:356},{s:3,ph:7.14,temp:20.9,turb:4.4,do:7.7,cond:332},{s:3,ph:7.23,temp:23.4,turb:3.8,do:8.6,cond:349},{s:3,ph:6.95,temp:21.1,turb:4.4,do:6.7,cond:341},{s:3,ph:7.33,temp:22.5,turb:3.7,do:9.3,cond:354},{s:3,ph:7.08,temp:20.5,turb:4.7,do:7.4,cond:327},{s:3,ph:7.17,temp:23.2,turb:4.0,do:8.7,cond:342},
  {s:3,ph:7.27,temp:21.4,turb:4.0,do:7.2,cond:351},{s:3,ph:7.02,temp:22.8,turb:3.5,do:9.5,cond:333},{s:3,ph:6.93,temp:20.3,turb:4.9,do:6.1,cond:363},{s:3,ph:7.44,temp:23.5,turb:3.1,do:9.9,cond:317},{s:3,ph:7.12,temp:21.6,turb:4.3,do:7.6,cond:347},{s:3,ph:7.20,temp:22.2,turb:3.8,do:8.3,cond:334},{s:3,ph:6.98,temp:20.8,turb:4.2,do:6.8,cond:357},{s:3,ph:7.36,temp:23.3,turb:3.5,do:9.0,cond:324},{s:3,ph:7.06,temp:21.1,turb:4.7,do:7.2,cond:344},{s:3,ph:7.15,temp:22.7,turb:3.8,do:8.1,cond:336},
  {s:3,ph:7.25,temp:23.1,turb:3.9,do:9.2,cond:360},{s:3,ph:7.03,temp:22.0,turb:4.2,do:7.6,cond:329},{s:3,ph:7.14,temp:23.2,turb:3.6,do:8.9,cond:352},{s:3,ph:7.18,temp:21.4,turb:4.3,do:7.8,cond:335},{s:3,ph:7.10,temp:22.7,turb:4.5,do:8.3,cond:346},{s:3,ph:7.00,temp:20.8,turb:4.6,do:7.1,cond:326},{s:3,ph:7.30,temp:22.5,turb:3.8,do:9.4,cond:361},{s:3,ph:7.01,temp:21.2,turb:4.7,do:7.5,cond:333},{s:3,ph:7.24,temp:23.0,turb:3.9,do:8.7,cond:358},{s:3,ph:7.11,temp:20.9,turb:4.4,do:8.2,cond:337},

  {s:4,ph:7.22,temp:22.6,turb:4.3,do:8.4,cond:345},{s:4,ph:7.09,temp:21.4,turb:3.7,do:7.6,cond:331},{s:4,ph:6.99,temp:22.9,turb:4.1,do:6.9,cond:349},{s:4,ph:7.36,temp:20.8,turb:3.4,do:9.5,cond:324},{s:4,ph:7.14,temp:23.3,turb:4.6,do:7.9,cond:355},{s:4,ph:7.29,temp:21.5,turb:3.8,do:8.7,cond:339},{s:4,ph:6.94,temp:22.2,turb:4.4,do:6.3,cond:363},{s:4,ph:7.41,temp:20.6,turb:3.5,do:9.1,cond:326},{s:4,ph:7.05,temp:23.5,turb:4.8,do:7.1,cond:348},{s:4,ph:7.17,temp:21.7,turb:3.6,do:8.8,cond:335},
  {s:4,ph:7.24,temp:22.4,turb:4.1,do:7.6,cond:342},{s:4,ph:7.11,temp:21.0,turb:3.3,do:9.2,cond:358},{s:4,ph:6.96,temp:23.2,turb:4.7,do:6.4,cond:337},{s:4,ph:7.32,temp:21.6,turb:3.8,do:8.8,cond:352},{s:4,ph:7.14,temp:22.1,turb:4.0,do:7.7,cond:327},{s:4,ph:7.21,temp:23.6,turb:3.4,do:9.4,cond:350},{s:4,ph:6.92,temp:20.5,turb:4.6,do:6.8,cond:366},{s:4,ph:7.37,temp:22.7,turb:3.1,do:9.2,cond:321},{s:4,ph:7.08,temp:21.2,turb:4.8,do:7.3,cond:348},{s:4,ph:7.19,temp:23.1,turb:3.7,do:8.2,cond:331},
  {s:4,ph:7.26,temp:21.8,turb:4.3,do:7.7,cond:354},{s:4,ph:7.03,temp:22.5,turb:3.5,do:9.6,cond:330},{s:4,ph:6.90,temp:20.7,turb:4.9,do:6.5,cond:363},{s:4,ph:7.42,temp:23.3,turb:3.2,do:9.1,cond:321},{s:4,ph:7.13,temp:21.3,turb:4.5,do:7.9,cond:350},{s:4,ph:7.23,temp:22.8,turb:3.7,do:8.3,cond:337},{s:4,ph:6.98,temp:20.5,turb:4.2,do:6.7,cond:358},{s:4,ph:7.35,temp:23.4,turb:3.5,do:9.5,cond:319},{s:4,ph:7.06,temp:21.8,turb:4.7,do:7.0,cond:347},{s:4,ph:7.16,temp:22.9,turb:3.8,do:8.6,cond:334},
  {s:4,ph:7.28,temp:20.6,turb:4.1,do:9.7,cond:362},{s:4,ph:7.03,temp:23.1,turb:3.5,do:7.4,cond:327},{s:4,ph:6.88,temp:21.5,turb:4.8,do:6.2,cond:346},{s:4,ph:7.40,temp:22.3,turb:3.4,do:9.4,cond:357},{s:4,ph:7.12,temp:20.8,turb:4.5,do:7.7,cond:331},{s:4,ph:7.22,temp:23.5,turb:3.7,do:8.5,cond:349},{s:4,ph:6.94,temp:21.1,turb:4.3,do:6.5,cond:342},{s:4,ph:7.37,temp:22.4,turb:3.3,do:9.8,cond:352},{s:4,ph:7.06,temp:20.5,turb:4.6,do:7.2,cond:326},{s:4,ph:7.15,temp:23.2,turb:3.9,do:8.0,cond:344},
  {s:4,ph:7.30,temp:21.3,turb:4.2,do:7.5,cond:354},{s:4,ph:7.01,temp:22.8,turb:3.5,do:9.2,cond:333},{s:4,ph:6.92,temp:20.3,turb:4.7,do:6.7,cond:367},{s:4,ph:7.46,temp:23.5,turb:3.1,do:9.9,cond:317},{s:4,ph:7.09,temp:21.7,turb:4.4,do:7.6,cond:348},{s:4,ph:7.20,temp:22.1,turb:3.8,do:8.7,cond:331},{s:4,ph:6.97,temp:20.8,turb:4.3,do:6.5,cond:360},{s:4,ph:7.38,temp:23.2,turb:3.4,do:9.1,cond:322},{s:4,ph:7.06,temp:21.2,turb:4.9,do:7.1,cond:349},{s:4,ph:7.15,temp:22.7,turb:3.7,do:8.2,cond:337},
  {s:4,ph:7.27,temp:20.4,turb:4.1,do:9.5,cond:362},{s:4,ph:7.04,temp:23.0,turb:3.4,do:7.8,cond:330},{s:4,ph:6.88,temp:21.6,turb:4.7,do:6.3,cond:346},{s:4,ph:7.39,temp:22.4,turb:3.2,do:9.2,cond:357},{s:4,ph:7.13,temp:20.8,turb:4.5,do:7.7,cond:330},{s:4,ph:7.24,temp:23.4,turb:3.8,do:8.5,cond:350},{s:4,ph:6.95,temp:21.0,turb:4.4,do:6.6,cond:341},{s:4,ph:7.33,temp:22.5,turb:3.6,do:9.3,cond:354},{s:4,ph:7.07,temp:20.5,turb:4.8,do:7.4,cond:326},{s:4,ph:7.16,temp:23.1,turb:3.9,do:8.8,cond:342},
  {s:4,ph:7.28,temp:21.3,turb:4.1,do:7.2,cond:351},{s:4,ph:7.00,temp:22.9,turb:3.5,do:9.5,cond:331},{s:4,ph:6.93,temp:20.2,turb:4.9,do:6.0,cond:364},{s:4,ph:7.44,temp:23.5,turb:3.1,do:9.9,cond:317},{s:4,ph:7.11,temp:21.6,turb:4.4,do:7.6,cond:346},{s:4,ph:7.21,temp:22.1,turb:3.7,do:8.3,cond:334},{s:4,ph:6.98,temp:20.9,turb:4.2,do:6.8,cond:356},{s:4,ph:7.36,temp:23.2,turb:3.4,do:9.1,cond:323},{s:4,ph:7.07,temp:21.4,turb:4.6,do:7.2,cond:344},{s:4,ph:7.15,temp:22.7,turb:3.8,do:8.1,cond:336},
  {s:4,ph:7.26,temp:20.5,turb:4.2,do:9.6,cond:361},{s:4,ph:7.05,temp:23.1,turb:3.6,do:7.9,cond:328},{s:4,ph:6.90,temp:21.8,turb:4.7,do:6.4,cond:344},{s:4,ph:7.41,temp:22.3,turb:3.3,do:9.3,cond:355},{s:4,ph:7.14,temp:20.9,turb:4.4,do:7.7,cond:332},{s:4,ph:7.23,temp:23.4,turb:3.8,do:8.5,cond:349},{s:4,ph:6.94,temp:21.1,turb:4.5,do:6.6,cond:340},{s:4,ph:7.32,temp:22.5,turb:3.7,do:9.4,cond:353},{s:4,ph:7.08,temp:20.5,turb:4.7,do:7.4,cond:326},{s:4,ph:7.17,temp:23.2,turb:4.0,do:8.7,cond:341},
  {s:4,ph:7.27,temp:21.4,turb:4.1,do:7.1,cond:350},{s:4,ph:7.02,temp:22.8,turb:3.5,do:9.5,cond:332},{s:4,ph:6.92,temp:20.3,turb:4.9,do:6.0,cond:364},{s:4,ph:7.43,temp:23.5,turb:3.1,do:9.9,cond:316},{s:4,ph:7.11,temp:21.6,turb:4.4,do:7.6,cond:346},{s:4,ph:7.19,temp:22.2,turb:3.8,do:8.3,cond:334},{s:4,ph:6.97,temp:20.8,turb:4.2,do:6.8,cond:357},{s:4,ph:7.35,temp:23.3,turb:3.5,do:9.1,cond:323},{s:4,ph:7.05,temp:21.1,turb:4.7,do:7.2,cond:344},{s:4,ph:7.14,temp:22.7,turb:3.8,do:8.1,cond:336},
];

function hashKey(key) {
  return require('crypto').createHash('sha256').update(key).digest('hex');
}

module.exports = async function runSeed() {
  const User    = require('./models/User');
  const Sensor  = require('./models/Sensor');
  const Reading = require('./models/Reading');
  const Alert   = require('./models/Alert');
  const { calculateRiskLevel, generateExplanation, shouldTriggerAlert } = require('./utils/complianceEngine');
  const crypto  = require('crypto');

  console.log('\n🌱 Starting database seed...');

  // Create users
  const createdUsers = [];
  for (const u of USERS) {
    const [user, created] = await User.findOrCreate({
      where: { email: u.email },
      defaults: { username: u.username, email: u.email, password: u.password, full_name: u.full_name, organization_type: u.organization_type }
    });
    createdUsers.push(user);
    console.log(`  ${created ? '✅ Created' : '⚠️  Exists'}: ${u.full_name}`);
  }

  // Create sensors
  const createdSensors = [];
  for (let i = 0; i < SENSORS.length; i++) {
    const s = SENSORS[i];
    const user = createdUsers[i];
    let sensor = await Sensor.findOne({ where: { sensor_name: s.sensor_name } });
    if (!sensor) {
      const rawKey = `AQ-${crypto.randomBytes(32).toString('hex')}`;
      sensor = await Sensor.create({ sensor_name: s.sensor_name, location: s.location, api_key: rawKey, api_key_hash: hashKey(rawKey), userId: user.id });
      console.log(`  ✅ Sensor: ${s.sensor_name} | API Key: ${rawKey}`);
    } else {
      console.log(`  ⚠️  Sensor exists: ${s.sensor_name}`);
    }
    createdSensors.push(sensor);
  }

  // Create readings
  const existing = await Reading.count();
  if (existing > 0) {
    console.log(`  ⚠️  Skipping readings - ${existing} already exist`);
  } else {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    let alertCount = 0;
    for (const r of RAW_READINGS) {
      const sensor = createdSensors[r.s];
      const { risk_level, reasons } = calculateRiskLevel(r.ph, r.turb, r.do, r.temp);
      const ai_explanation = generateExplanation(r.ph, r.turb, r.do, risk_level, USERS[r.s].organization_type);
      const ts = new Date(now - Math.random() * thirtyDays);
      const reading = await Reading.create({ sensorId: sensor.id, ph: r.ph, turbidity: r.turb, temperature: r.temp, tds: Math.round(r.cond * 0.64), dissolved_oxygen: r.do, risk_level, ai_explanation, createdAt: ts, updatedAt: ts });
      if (shouldTriggerAlert(r.ph, r.turb, r.do)) {
        await Alert.create({ ReadingId: reading.id, severity: risk_level === 'CRITICAL' ? 'CRITICAL' : 'WARNING', message: `Issue on "${sensor.sensor_name}". Risk: ${risk_level}. ${reasons.join('. ')}`, createdAt: ts, updatedAt: ts });
        alertCount++;
      }
    }
    console.log(`  ✅ Created 500 readings + ${alertCount} alerts`);
  }

  console.log('\n✅ SEED COMPLETE!');
  console.log('══════════════════════════════════════════');
  console.log('All user emails end with @aquasense.com');
  console.log('All passwords: Aqua@1234');
  console.log('══════════════════════════════════════════\n');
};