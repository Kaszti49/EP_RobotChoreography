#include "keret_stub.h"
unsigned long millis() { return 0; }
int analogRead(int) { return 0; }
void motor(int, int) {}
void varj(int) {}
void uzenet(String) {}
void uzenet(const char*) {}
void enkoderNullaz() {}
bool menj(long, long, int) { return true; }
void szenzorOlvas() {}
void szenzorNormal() {}
int vonalPozicioSzamol() { return 0; }
int szenzor[5]; int szenzorNorm[5]; bool vonalLatszik;
long encBal, encJobb;
int kalFeher[5], kalFekete[5];
const uint8_t SENSOR_PIN[5] = {36,39,34,35,32};
int kuszob = 1700, alapSebesseg = 120, minimumPWM = 70, maximumPWM = 255, maxKorrekcio = 75;
float utolsoPozicio; int keresesiIrany; int vonalvesztesSzamlalo;
