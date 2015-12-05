TsukubaDistanceConverter
========================

Usage
-----

### From distance

`http://localhost:3000/convert/fromDistance?distance=500`

```json
{

    "start": "第1エリア",
    "end": "第3エリア（L棟）/第2エリア（D棟）",
    "text": "500mは、第1エリア と 第3エリア（L棟）/第2エリア（D棟） 間の距離と同じくらいです。"

}
```

### From geological two points

`http://localhost:3000/convert/fromAddress?origin=東京駅&dest=有楽町駅`

```json
{

    "google_origin": "日本, 〒100-0005 東京都千代田区丸の内１丁目９ 東京駅",
    "google_destination": "日本, 〒100-0006 東京都千代田区有楽町２丁目９ 有楽町駅",
    "start": "つくばセンター",
    "end": "筑波大学附属病院",
    "text": "東京駅（日本, 〒100-0005 東京都千代田区丸の内１丁目９ 東京駅）から有楽町駅（日本, 〒100-0006 東京都千代田区有楽町２丁目９ 有楽町駅）間は、つくばセンター と 筑波大学附属病院 間の距離より短いくらいです。"
}
```
