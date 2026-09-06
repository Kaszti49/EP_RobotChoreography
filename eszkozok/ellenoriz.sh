#!/usr/bin/env bash
# Syntax-check every paste-in sketch against a stub of the on-robot framework.
#
# The sketches are not standalone programs: they call the "keret 2.0" API
# (motor, encBal, uzenet, ...) that only exists on the robot. keret_stub.h +
# stub_impl.cpp declare that API so a desktop g++ can parse the files and
# catch the errors that would otherwise cost a full compile+upload cycle.
#
# These stubs are for -fsyntax-only. They are NOT a simulator and must never
# be uploaded to a robot.
#
#   usage:  bash eszkozok/ellenoriz.sh
#
# The other check that was run when this was built is a numeric re-simulation
# of a choreography in Python: replicate the loop from show_robot.txt section
# 10 (slew limit -> kinematics -> VMAX scaling -> pose integration), then
# report the minimum pairwise distance, the field bounds, the peak wheel
# speed against VMAX, and the endpoint error under injected calibration
# drift. The simulator page does the same thing in szimulal().

set -u
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
gyoker="$(dirname "$here")"
munka="$(mktemp -d)"
trap 'rm -rf "$munka"' EXIT

cp "$here/keret_stub.h" "$munka/"
hiba=0

for f in "$gyoker"/kalibracio/K*.txt "$gyoker"/show/show_robot.txt; do
  [ -e "$f" ] || continue
  nev="$(basename "$f" .txt)"
  { echo '#include "keret_stub.h"'; cat "$f"; } > "$munka/$nev.cpp"
  if g++ -std=c++17 -fsyntax-only -Wall \
         -Wno-unused-variable -Wno-unused-but-set-variable \
         -I "$munka" "$munka/$nev.cpp" 2>"$munka/$nev.log"; then
    echo "  OK    $nev"
  else
    echo "  HIBA  $nev"
    sed 's/^/          /' "$munka/$nev.log" | head -20
    hiba=1
  fi
done

if [ "$hiba" -eq 0 ]; then
  echo "Minden vazlat lefordul."
else
  echo "Van hibas vazlat -- javitsd, mielott feltoltod."
fi
exit "$hiba"
