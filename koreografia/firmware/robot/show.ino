// =====================================================================
//  show.ino -- HELYKITOLTO
//
//  A tools/firmware.js build parancsa ezt a fajlt a fordito altal
//  kibocsatott SHOW_robot<N>.txt-vel cserali ki a build mappaban.
//  Onmagaban csak annyit tud, hogy a keret leforduljon es a
//  Muszerfal-parancsok (M, G, P, V, ...) hasznalhatok legyenek.
// =====================================================================

void indulas() {
  uzenet("nincs show ebben a firmware-ben -- tolts fel egy SHOW_robot<N>.txt-t");
}

void vezerles() {
  motor(0, 0);
}
