/*
  Extended Smart Power Meter Mesh Network Code
  Based on PainlessMesh library example
*/

#include "painlessMesh.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// Mesh network settings
#define   MESH_PREFIX     "PowerNet"
#define   MESH_PASSWORD   "8347hg378fh4j8734hjf34"
#define   MESH_PORT       5555
#define   NODE_UID        "PowerUser1_Dhruv"

// Pin Definitions
#define PROXIMITY_TRIG_PIN 12
#define PROXIMITY_ECHO_PIN 14
#define TAMPER_BUTTON_PIN  13
#define CURRENT_SENSOR_PIN 26
#define VOLTAGE_SENSOR_PIN 27

// LCD Display settings
#define LCD_ADDRESS 0x27
#define LCD_COLUMNS 16
#define LCD_ROWS    2

// Tamper detection settings
#define TAMPER_THRESHOLD_CYCLES 2
#define MEASUREMENT_FREQUENCY 20 // 20Hz sampling rate
#define BROADCAST_INTERVAL 1000  // 1 second in milliseconds

// Voltage and current calibration values
// These should be adjusted based on actual hardware calibration
#define VOLTAGE_CALIBRATION 0.09  // Example calibration factor
#define CURRENT_CALIBRATION 0.066 // Example calibration factor
#define VREF 3.3               // ADC reference voltage (3.3V for ESP32)
#define ADC_RESOLUTION 4095    // 12-bit ADC (2^12 - 1)

// Initialize objects
Scheduler userScheduler;
painlessMesh mesh;
LiquidCrystal_I2C lcd(LCD_ADDRESS, LCD_COLUMNS, LCD_ROWS);

// Task declarations
void sendMessage();
void measurePower();
void checkTamper();
void updateDisplay();

Task taskSendMessage(TASK_SECOND * 1, TASK_FOREVER, &sendMessage);
Task taskMeasurePower(1000 / MEASUREMENT_FREQUENCY, TASK_FOREVER, &measurePower);
Task taskCheckTamper(TASK_SECOND * 1, TASK_FOREVER, &checkTamper);
Task taskUpdateDisplay(TASK_SECOND * 2, TASK_FOREVER, &updateDisplay);

// Variables to store measurements
float voltageReadings[MEASUREMENT_FREQUENCY];
float currentReadings[MEASUREMENT_FREQUENCY];
int readingIndex = 0;
float lastDistance = 0;
int distanceChangedCount = 0;
bool buttonLastState = HIGH;
int buttonChangedCount = 0;
bool tamperDetected = false;

// Power calculation variables
float voltage = 0;
float current = 0;
float realPower = 0;      // Watts
float apparentPower = 0;  // VA
float powerFactor = 0;    // Power factor (0-1)
float energyConsumed = 0; // kWh
unsigned long lastWeekReset = 0;
unsigned long weeklyTimestamp = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds

// Variables for RMS calculations
float voltageSamples[MEASUREMENT_FREQUENCY];
float currentSamples[MEASUREMENT_FREQUENCY];
float instantPower[MEASUREMENT_FREQUENCY];
float sumInstantPower = 0;

// Display mode (cycles through different screens)
byte displayMode = 0;
unsigned long lastDisplayChange = 0;

// Function to measure distance using ultrasonic sensor
float measureDistance() {
  digitalWrite(PROXIMITY_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(PROXIMITY_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(PROXIMITY_TRIG_PIN, LOW);
  
  // Measure the pulse duration
  float duration = pulseIn(PROXIMITY_ECHO_PIN, HIGH);
  
  // Calculate distance
  return (duration * 0.0343) / 2; // Speed of sound in cm/microsecond
}

// Function to check button state
bool isButtonPressed() {
  return digitalRead(TAMPER_BUTTON_PIN) == LOW;
}

// Function to calculate RMS from samples
float calculateRMS(float samples[], int numSamples) {
  float sum = 0;
  for (int i = 0; i < numSamples; i++) {
    sum += samples[i] * samples[i];
  }
  return sqrt(sum / numSamples);
}

// Function to broadcast power measurements
void sendMessage() {
  if (tamperDetected) {
    return; // Don't send regular updates if tamper is detected
  }

  // Create JSON message
  DynamicJsonDocument jsonDoc(256);
  jsonDoc["type"] = "power_data";
  jsonDoc["node_uid"] = NODE_UID;
  jsonDoc["voltage"] = voltage;
  jsonDoc["current"] = current;
  jsonDoc["real_power"] = realPower;
  jsonDoc["apparent_power"] = apparentPower;
  jsonDoc["power_factor"] = powerFactor;
  jsonDoc["energy_kwh"] = energyConsumed;

  String msg;
  serializeJson(jsonDoc, msg);
  mesh.sendBroadcast(msg);
  
  // Reset the measurement index for the next cycle
  readingIndex = 0;
  sumInstantPower = 0;
}

// Function to send tamper alert
void sendTamperAlert(String reason) {
  DynamicJsonDocument jsonDoc(128);
  jsonDoc["type"] = "tamper_alert";
  jsonDoc["node_uid"] = NODE_UID;
  jsonDoc["reason"] = reason;

  String msg;
  serializeJson(jsonDoc, msg);
  mesh.sendBroadcast(msg);
  
  Serial.println("TAMPER ALERT: " + reason);
}

// Function to measure power
void measurePower() {
  if (tamperDetected) {
    return; // Don't measure if tamper is detected
  }

  // Read voltage and current sensors
  int voltageRaw = analogRead(VOLTAGE_SENSOR_PIN);
  int currentRaw = analogRead(CURRENT_SENSOR_PIN);
  
  // Convert ADC readings to voltage (0-3.3V)
  float voltageValue = (float)voltageRaw * VREF / ADC_RESOLUTION;
  float currentValue = (float)currentRaw * VREF / ADC_RESOLUTION;
  
  // Apply calibration to get actual voltage and current
  // For ZMPT101B, assuming it outputs a sine wave centered around VREF/2
  voltageValue = (voltageValue - (VREF/2)) * VOLTAGE_CALIBRATION;
  // For ACS712, assuming it outputs 0A at VREF/2
  currentValue = (currentValue - (VREF/2)) * CURRENT_CALIBRATION;
  
  // Store samples for RMS calculation
  voltageSamples[readingIndex] = voltageValue;
  currentSamples[readingIndex] = currentValue;
  
  // Calculate instantaneous power
  instantPower[readingIndex] = voltageValue * currentValue;
  sumInstantPower += instantPower[readingIndex];
  
  // Increment reading index
  readingIndex = (readingIndex + 1) % MEASUREMENT_FREQUENCY;
  
  // Once we have a full cycle of readings, calculate power metrics
  if (readingIndex == 0) {
    // Calculate RMS values
    voltage = calculateRMS(voltageSamples, MEASUREMENT_FREQUENCY);
    current = calculateRMS(currentSamples, MEASUREMENT_FREQUENCY);
    
    // Calculate power values
    realPower = sumInstantPower / MEASUREMENT_FREQUENCY; // Average instantaneous power
    apparentPower = voltage * current;                   // Apparent power (VA)
    
    // Avoid division by zero
    if (apparentPower > 0) {
      powerFactor = realPower / apparentPower;
      // Power factor can't be greater than 1
      if (powerFactor > 1) powerFactor = 1;
    } else {
      powerFactor = 0;
    }
    
    // Calculate energy consumed (kWh)
    float periodHours = 1.0 / 3600.0; // 1 second in hours
    energyConsumed += (realPower / 1000.0) * periodHours; // Add kWh
    
    // Reset sum for next cycle
    sumInstantPower = 0;
  }
  
  // Check if we need to reset weekly counter
  unsigned long currentTime = millis();
  if (currentTime - lastWeekReset >= weeklyTimestamp) {
    energyConsumed = 0;
    lastWeekReset = currentTime;
  }
}

// Function to check for tampering
void checkTamper() {
  // Check proximity sensor
  float currentDistance = measureDistance();
  if (abs(currentDistance - lastDistance) > 5.0) { // 5cm threshold for change
    distanceChangedCount++;
  } else {
    distanceChangedCount = 0;
  }
  lastDistance = currentDistance;
  
  // Check button state
  bool buttonCurrentState = isButtonPressed();
  if (buttonCurrentState != buttonLastState) {
    buttonChangedCount++;
  } else {
    buttonChangedCount = 0;
  }
  buttonLastState = buttonCurrentState;
  
  // Detect tamper conditions
  if (distanceChangedCount >= TAMPER_THRESHOLD_CYCLES) {
    if (!tamperDetected) {
      tamperDetected = true;
      sendTamperAlert("Proximity sensor triggered");
    }
  }
  
  if (buttonChangedCount >= TAMPER_THRESHOLD_CYCLES) {
    if (!tamperDetected) {
      tamperDetected = true;
      sendTamperAlert("Button state changed");
    }
  }
}

// Function to update LCD display
void updateDisplay() {
  lcd.clear();
  
  if (tamperDetected) {
    lcd.setCursor(0, 0);
    lcd.print("TAMPER DETECTED!");
    return;
  }
  
  // Compact display with abbreviations
  switch(displayMode) {
    case 0: // RMS voltage and current
      lcd.setCursor(0, 0);
      lcd.print("V:");
      lcd.print(voltage, 1);
      lcd.print("V ");
      lcd.print("I:");
      lcd.print(current, 2);
      lcd.print("A");
      break;
      
    case 1: // Power and power factor
      lcd.setCursor(0, 0);
      lcd.print("P:");
      lcd.print(realPower, 0);
      lcd.print("W ");
      lcd.print("PF:");
      lcd.print(powerFactor, 2);
      break;
  }
  
  // Always show the node ID (abbreviated) on the second line
  lcd.setCursor(0, 1);
  lcd.print("ID:");
  lcd.print(mesh.getNodeId() % 10000); // Just show last 4 digits
  lcd.print(" ");
  
  // Show energy on second line when in voltage/current mode
  if (displayMode == 0) {
    lcd.print("E:");
    lcd.print(energyConsumed, 2);
    lcd.print("kWh");
  }
  
  // Cycle through display modes every 3 seconds
  if (millis() - lastDisplayChange > 3000) {
    displayMode = (displayMode + 1) % 2;
    lastDisplayChange = millis();
  }
}

// Mesh network callback functions
void receivedCallback(uint32_t from, String &msg) {
  Serial.printf("Rcv %u: %s\n", from, msg.c_str());
}

void newConnectionCallback(uint32_t nodeId) {
  Serial.printf("New Conn %u\n", nodeId);
}

void changedConnectionCallback() {
  Serial.printf("Conn changed\n");
}

void nodeTimeAdjustedCallback(int32_t offset) {
  Serial.printf("Time adj %d\n", offset);
}

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(PROXIMITY_TRIG_PIN, OUTPUT);
  pinMode(PROXIMITY_ECHO_PIN, INPUT);
  pinMode(TAMPER_BUTTON_PIN, INPUT_PULLUP);
  
  // Set ADC resolution for ESP32
  analogReadResolution(12); // 12-bit resolution for ESP32
  
  // Initialize LCD
  Wire.begin();
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Power Meter");
  lcd.setCursor(0, 1);
  lcd.print("Init...");
  
  // Initialize mesh network
  mesh.setDebugMsgTypes(ERROR | STARTUP);
  mesh.init(MESH_PREFIX, MESH_PASSWORD, &userScheduler, MESH_PORT);
  mesh.onReceive(&receivedCallback);
  mesh.onNewConnection(&newConnectionCallback);
  mesh.onChangedConnections(&changedConnectionCallback);
  mesh.onNodeTimeAdjusted(&nodeTimeAdjustedCallback);
  
  // Add tasks to scheduler
  userScheduler.addTask(taskSendMessage);
  userScheduler.addTask(taskMeasurePower);
  userScheduler.addTask(taskCheckTamper);
  userScheduler.addTask(taskUpdateDisplay);
  
  // Enable tasks
  taskSendMessage.enable();
  taskMeasurePower.enable();
  taskCheckTamper.enable();
  taskUpdateDisplay.enable();
  
  // Initialize timestamps
  lastWeekReset = millis();
  lastDisplayChange = millis();
  
  // Display initialization complete
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Mesh ID:");
  lcd.setCursor(0, 1);
  lcd.print(mesh.getNodeId());
  delay(2000);
}

void loop() {
  mesh.update();
}