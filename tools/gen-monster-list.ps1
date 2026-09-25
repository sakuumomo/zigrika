# 生成 Zigrika 野怪召唤 ID 表
# 用法: pwsh -File tools\gen-monster-list.ps1
# 原理: BlueprintConfig 里 EntityLogic == "Monster" 的蓝图类型,再扫 LevelEntityConfig 取出对应的 EntityId/MapId

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$bpPath = Join-Path $root 'assets\BinData\BlueprintConfig.json'
$lecPath = Join-Path $root 'assets\BinData\LevelEntityConfig.json'
$outPath = Join-Path $root '野怪召唤ID表.txt'

Write-Host "读取蓝图配置: $bpPath"
$monsterTypes = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($bp in (Get-Content $bpPath -Raw | ConvertFrom-Json)) {
    if ($bp.EntityLogic -eq 'Monster') { [void]$monsterTypes.Add($bp.BlueprintType) }
}
Write-Host "怪物蓝图类型: $($monsterTypes.Count)"

# 流式扫描,避免把 260MB JSON 全塞进内存
# 注意: LevelEntityConfig.json 是带缩进换行的格式化 JSON,所以正则里用 \s* 容错
$rx = [regex]'"MapId":\s*(-?\d+),\s*"EntityId":\s*(-?\d+),\s*"BlueprintType":\s*"([^"]*)",\s*"Name":\s*"((?:[^"\\]|\\.)*)"'
$rows = New-Object 'System.Collections.Generic.List[object]'
$seen = New-Object 'System.Collections.Generic.HashSet[string]'
$sr = New-Object System.IO.StreamReader($lecPath)
$buf = [char[]]::new(33554432)
$carry = ''
$totalRows = 0
$sep = "`n  {"
while (($n = $sr.Read($buf, 0, $buf.Length)) -gt 0) {
    $seg = $carry + [string]::new($buf, 0, $n)
    $cut = $seg.LastIndexOf($sep)
    if ($cut -lt 0) { $carry = $seg; continue }
    $head = $seg.Substring(0, $cut)
    $carry = $seg.Substring($cut)
    $ms = $rx.Matches($head)
    $totalRows += $ms.Count
    foreach ($m in $ms) {
        if (-not $monsterTypes.Contains($m.Groups[3].Value)) { continue }
        $key = $m.Groups[1].Value + '|' + $m.Groups[2].Value
        if ($seen.Add($key)) {
            $rows.Add([pscustomobject]@{
                MapId         = [int]$m.Groups[1].Value
                EntityId      = [long]$m.Groups[2].Value
                BlueprintType = $m.Groups[3].Value
                Name          = $m.Groups[4].Value
            })
        }
    }
}
$sr.Close()
Write-Host "扫描到配置行: $totalRows"
Write-Host "野怪条目(去重后): $($rows.Count)"

$out = New-Object 'System.Collections.Generic.List[string]'
$out.Add('# Zigrika 野怪召唤 ID 表')
$out.Add('# 由 tools/gen-monster-list.ps1 生成,数据来源: assets/BinData/LevelEntityConfig.json + BlueprintConfig.json')
$out.Add('#')
$out.Add('# 用法(在游戏内聊天框直接发送):')
$out.Add('#   spawn <EntityId>                在当前地图生成')
$out.Add('#   spawn_map <EntityId> <MapId>    强制按指定地图的配置行生成(当前地图找不到时用这个)')
$out.Add('#   可选参数: spawn <EntityId> true           -> 冻结实体(不主动攻击)')
$out.Add('#             spawn <EntityId> false true     -> 开启韧性破坏(tune break)')
$out.Add('#   多个命令可用 ; 分隔,例如: spawn 12345; spawn 67890')
$out.Add('#')
$out.Add("# 共 $($rows.Count) 条 (MapId+EntityId 去重) / 怪物蓝图类型 $($monsterTypes.Count) 个")
$out.Add('#')
$out.Add(("MapId`tEntityId`tBlueprintType`tName"))
foreach ($r in ($rows | Sort-Object MapId, EntityId)) {
    $out.Add("$($r.MapId)`t$($r.EntityId)`t$($r.BlueprintType)`t$($r.Name)")
}
Set-Content -Path $outPath -Value $out -Encoding UTF8
Write-Host "已写出: $outPath"

# 4. 名称索引 —— 方便按中文名反查 EntityId
$idxPath = Join-Path $root '野怪名称索引.txt'
$byName = @{}
foreach ($r in $rows) {
    $base = ($r.Name -replace '\d+$', '')
    if ([string]::IsNullOrWhiteSpace($base)) { $base = '(无名)' }
    if (-not $byName.ContainsKey($base)) { $byName[$base] = New-Object 'System.Collections.Generic.List[object]' }
    $byName[$base].Add($r)
}
$idx = New-Object 'System.Collections.Generic.List[string]'
$idx.Add('# Zigrika 野怪名称索引 —— 用中文名反查 EntityId')
$idx.Add('# 用法: 在游戏内聊天框发送   spawn <EntityId>')
$idx.Add('# 说明: 名称里的尾部数字是同一怪物在地图上的多个摆放点,已合并;EntityId 取最小值')
$idx.Add('#')
$idx.Add("# 共 $($byName.Count) 个名称")
$idx.Add('#')
$idx.Add("名称`tEntityId`tMapId`tBlueprintType`t该名称总数")
foreach ($k in ($byName.Keys | Sort-Object)) {
    $items = $byName[$k]
    $best = $items | Sort-Object EntityId | Select-Object -First 1
    $idx.Add("$k`t$($best.EntityId)`t$($best.MapId)`t$($best.BlueprintType)`t$($items.Count)")
}
Set-Content -Path $idxPath -Value $idx -Encoding UTF8
Write-Host "已写出: $idxPath"

Write-Host ''
Write-Host '=== 各地图野怪数量 (Top 15) ==='
$rows | Group-Object MapId | Sort-Object Count -Descending | Select-Object -First 15 Count, Name | Format-Table -AutoSize | Out-String | Write-Host
