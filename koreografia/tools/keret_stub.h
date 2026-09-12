// Minimal stand-in for the on-robot framework ("keret 2.0"), so the paste-in
// sketches can be syntax-checked with a desktop compiler.
#pragma once
#include <cstdint>
#include <cmath>
#include <cstdlib>
#include <string>

// --- Arduino-ish basics ---
typedef std::string ArduinoString;
struct String {
  std::string s;
  String() {}
  String(const char* c) : s(c) {}
  String(int v) : s(std::to_string(v)) {}
  String(long v) : s(std::to_string(v)) {}
  String(unsigned long v) : s(std::to_string(v)) {}
  String(float v, int = 2) : s(std::to_string(v)) {}
  String(double v, int = 2) : s(std::to_string(v)) {}
  String operator+(const String& o) const { String r; r.s = s + o.s; return r; }
};
inline String operator+(const char* a, const String& b) { return String(a) + b; }

unsigned long millis();
int analogRead(int pin);
template <class T> T constrain(T v, T lo, T hi) { return v < lo ? lo : (v > hi ? hi : v); }

// --- framework API (Segedlet.txt) ---
void motor(int bal, int jobb);
void varj(int ms);
void uzenet(String sz);
void uzenet(const char* sz);
void enkoderNullaz();
bool menj(long impBal, long impJobb, int pwm);
void szenzorOlvas();
void szenzorNormal();
int  vonalPozicioSzamol();

extern int szenzor[5];
extern int szenzorNorm[5];
extern bool vonalLatszik;
extern long encBal, encJobb;
extern int kalFeher[5], kalFekete[5];
extern const uint8_t SENSOR_PIN[5];

extern int kuszob;
extern int alapSebesseg;
extern int minimumPWM;
extern int maximumPWM;
extern int maxKorrekcio;
extern float utolsoPozicio;
extern int keresesiIrany;
extern int vonalvesztesSzamlalo;
