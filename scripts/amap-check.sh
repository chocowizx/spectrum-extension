#!/usr/bin/env bash
# Verify an Amap (高德 Gāodé) Web服务 key and reverse-geocode the home coords.
# Usage:  export AMAP_MAPS_API_KEY=...  &&  ./scripts/amap-check.sh
#         ./scripts/amap-check.sh 116.8205,39.9295

set -uo pipefail

LOC="${1:-116.8205,39.9295}"   # GCJ-02, lng,lat
KEY="${AMAP_MAPS_API_KEY:-}"

if [ -z "$KEY" ]; then
  echo "✗ AMAP_MAPS_API_KEY is not set."
  echo "  Run:  export AMAP_MAPS_API_KEY=your_key_here"
  exit 1
fi

explain() {
  case "$1" in
    INVALID_USER_KEY)      echo "  → The key is wrong or not activated yet. Recheck the copy/paste." ;;
    USERKEY_PLAT_NOMATCH)  echo "  → Wrong key TYPE. You created a JS API / Android / iOS key." \
                                "Create a new key of type 服务平台=Web服务 (Web fúwù)." ;;
    INVALID_USER_SCODE)    echo "  → Key is bound to a package/domain. Remove the binding, or make a fresh Web服务 key." ;;
    DAILY_QUERY_OVER_LIMIT) echo "  → Daily quota exhausted. Wait for reset." ;;
    USER_DAILY_QUERY_OVER_LIMIT) echo "  → Daily quota exhausted. Wait for reset." ;;
    CUQPS_HAS_EXCEEDED_THE_LIMIT) echo "  → Rate limited. Wait a moment and retry." ;;
    NO_REALNAME_AUTHENTICATION) echo "  → Account needs 实名认证 (shímíng rènzhèng) real-name verification first." ;;
  esac
}

echo "── Reverse geocode ── $LOC (GCJ-02, lng,lat)"
RESP=$(curl -sS --max-time 20 --get \
  --data-urlencode "key=$KEY" \
  --data-urlencode "location=$LOC" \
  --data-urlencode "extensions=all" \
  "https://restapi.amap.com/v3/geocode/regeo")

if [ -z "$RESP" ]; then
  echo "✗ No response. Network blocked? This will not work from a remote/web session."
  exit 1
fi

python3 - "$RESP" <<'PY'
import json, sys
try:
    d = json.loads(sys.argv[1])
except Exception:
    print("✗ Non-JSON response:", sys.argv[1][:300]); sys.exit(1)
if d.get("status") != "1":
    print("✗ status=%s  infocode=%s  info=%s" % (d.get("status"), d.get("infocode"), d.get("info")))
    sys.exit(2)
r = d.get("regeocode", {})
print("✓ Address:", r.get("formatted_address"))
c = r.get("addressComponent", {})
print("  Province/City/District:", c.get("province"), "/", c.get("city") or "(direct)", "/", c.get("district"))
print("  Township:", c.get("township"))
b = c.get("building", {}) or {}
if b.get("name"): print("  Building:", b.get("name"))
nb = c.get("neighborhood", {}) or {}
if nb.get("name"): print("  Neighborhood:", nb.get("name"))
poi = r.get("pois", [])[:5]
if poi:
    print("  Nearest POIs:")
    for p in poi:
        print("   -", p.get("name"), "|", p.get("type","").split(";")[0], "|", p.get("distance"), "m")
PY
rc=$?
if [ $rc -ne 0 ]; then
  code=$(printf '%s' "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('info',''))" 2>/dev/null)
  explain "$code"
  exit $rc
fi

echo
echo "── Around-search test ── 药店 (yàodiàn) pharmacies within 2 km"
curl -sS --max-time 20 --get \
  --data-urlencode "key=$KEY" \
  --data-urlencode "location=$LOC" \
  --data-urlencode "keywords=药店" \
  --data-urlencode "radius=2000" \
  --data-urlencode "sortrule=distance" \
  --data-urlencode "offset=5" \
  "https://restapi.amap.com/v3/place/around" \
| python3 -c "
import sys, json
d = json.load(sys.stdin)
if d.get('status') != '1':
    print('✗', d.get('info'), d.get('infocode')); raise SystemExit(1)
ps = d.get('pois', [])
print('✓ %s results (showing %d)' % (d.get('count'), len(ps)))
for p in ps:
    print('  -', p.get('name'), '|', p.get('distance'), 'm |', p.get('address'))
"

echo
echo "✓ Key works. Paste this output back to Claude."
