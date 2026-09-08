const unsigned char PWM = 100;

void elore(unsigned char sebesseg, unsigned int tavolsag,
           unsigned char korrigalas, bool debug) {
  enkoderNullaz();

  if (debug) {
    uzenet("Előre " + String(tavolsag) + " @ " + String(sebesseg) + " [" +
           String(korrigalas) + "]");
    uzenet("Jobb enkóder előtte: " + String(encJobb));
    uzenet("Bal enkóder előtte: " + String(encBal));
  }

  motor(sebesseg - korrigalas, sebesseg + korrigalas);
  varj(tavolsag);
  motor(0, 0);

  if (debug) {
    uzenet("Jobb enkóder utána: " + String(encJobb));
    uzenet("Bal enkóder utána: " + String(encBal));
  }
}

void hatra(unsigned char sebesseg, unsigned int tavolsag,
           unsigned char korrigalas, bool debug) {
  enkoderNullaz();

  if (debug) {
    uzenet("Hátra " + String(tavolsag) + " @ " + String(sebesseg) + " [" +
           String(korrigalas) + "]");
    uzenet("Jobb enkóder előtte: " + String(encJobb));
    uzenet("Bal enkóder előtte: " + String(encBal));
  }

  motor(-sebesseg - korrigalas, -sebesseg + korrigalas);
  varj(tavolsag);
  motor(0, 0);

  if (debug) {
    uzenet("Jobb enkóder utána: " + String(encJobb));
    uzenet("Bal enkóder utána: " + String(encBal));
  }
}

void kanyar(float fok, bool debug) {
  enkoderNullaz();

  if (debug) {
    uzenet("Kanyar " + String(fok));
    uzenet("Jobb enkóder előtte: " + String(encJobb));
    uzenet("Bal enkóder előtte: " + String(encBal));
  }

  motor(PWM / 2, PWM / 4);
  varj(2500);

  if (debug) {
    uzenet("Jobb enkóder utána: " + String(encJobb));
    uzenet("Bal enkóder utána: " + String(encBal));
  }
}

void indulas(void) {
  uzenet("");
  uzenet("Program indul");

  motor(0, 0);
  enkoderNullaz();
  varj(3000);

  // const unsigned int tavolsagok[] = {100, 200, 400, 800, 1600, 3200};
  // for (int i = 0; i < sizeof(tavolsagok) / sizeof(unsigned int); i++) {
  //   uzenet("");
  //   elore(PWM, tavolsagok[i], 0, true);
  //   varj(2000);

  //   uzenet("");
  //   hatra(PWM, tavolsagok[i], 0, true);
  //   varj(2000);
  // }

  for (int i = 0; i < 5; i++) {
    uzenet("");
    motor(PWM, PWM);
    varj(2500);
    kanyar(90.0f, true);
    motor(PWM, PWM);
    varj(2500);
    kanyar(90.0f, true);
    motor(PWM, PWM);
    varj(2500);
    kanyar(90.0f, true);
    motor(PWM, PWM);
    varj(2500);
    kanyar(90.0f, true);
  }

  uzenet("");
  uzenet("Program vége");
  uzenet("");
}

void vezerles(void) {}