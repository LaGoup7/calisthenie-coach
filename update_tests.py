from pathlib import Path
root=Path('/mnt/data/kinetik_lotA')
for name in ['test-step10-runtime.js','test-step11-runtime.js','test-step12-runtime.js','test-step13-runtime.js','test-step14-runtime.js','test-step15-runtime.js']:
    p=root/name;s=p.read_text().replace('10.130.0','10.131.0').replace('10.130','10.131').replace('10-130-multidevice-account','10-131-integrity-lot-a')
    p.write_text(s)
for name in ['test-step10-runtime.js','test-step11-runtime.js']:
    p=root/name;s=p.read_text()
    s=s.replace("appText.includes(\"['localNotificationState','webPushDeviceState'].includes(name)\")", "appText.includes('function backupStorageEntries()')&&appText.includes(\"'localNotificationState','webPushDeviceState','skillPriorities'\")")
    p.write_text(s)
