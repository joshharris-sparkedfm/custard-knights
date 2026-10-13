$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.IO;
public static class Beta14Crc {
 static readonly uint[] Table = Build();
 static uint[] Build(){var t=new uint[256];for(uint n=0;n<256;n++){uint c=n;for(int k=0;k<8;k++)c=(c&1)!=0?0xedb88320U^(c>>1):c>>1;t[n]=c;}return t;}
 public static uint Read(Stream s){uint c=0xffffffffU;var b=new byte[1048576];int n;while((n=s.Read(b,0,b.Length))>0)for(int k=0;k<n;k++)c=Table[(c^b[k])&255]^(c>>8);return c^0xffffffffU;}
}
'@
$preview = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'preview-export.json') | ConvertFrom-Json
$info = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'friends-build-info.json') | ConvertFrom-Json
$materials = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'friends-materials-verification.json') | ConvertFrom-Json
$friendsPath = Join-Path (Split-Path $preview.zip) 'Custard-Knights-Friends-0.3.0-beta.14.zip'
$results = @()
foreach ($zipPath in @($preview.zip, $friendsPath)) {
 $zip = [IO.Compression.ZipFile]::OpenRead($zipPath)
 try {
  $checked = @()
  foreach ($entry in $zip.Entries) {
   $stream=$entry.Open(); try {$crc=[Beta14Crc]::Read($stream)} finally {$stream.Dispose()}
   if ($crc -ne $entry.Crc32) {throw "CRC mismatch $($entry.FullName)"}
   $stream=$entry.Open(); try {$hash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($stream)).ToLowerInvariant()} finally {$stream.Dispose()}
   if ($zipPath -eq $preview.zip) {$relative=$entry.FullName.Substring((Split-Path $preview.folder -Leaf).Length+1); $expected=@($preview.allArchiveFiles | Where-Object path -eq $relative)[0]}
   elseif ($entry.FullName.StartsWith('Game/')) {$expected=@($info.gameFiles | Where-Object path -eq $entry.FullName)[0]}
   else {$expected=$materials.files.($entry.FullName)}
   if (!$expected -or $expected.sha256 -ne $hash -or $expected.bytes -ne $entry.Length) {throw "Exact hash/length mismatch $($entry.FullName)"}
   $checked += @{path=$entry.FullName; bytes=$entry.Length; sha256=$hash; crc32=$crc}
  }
  $results += @{archive=$zipPath;entries=$checked.Count;crcPassed=$true;exactManifestHashes=$true;files=$checked}
 } finally {$zip.Dispose()}
}
@{reader='.NET ZipArchive and independently compiled CRC32, SHA256.HashData'; sourceCommit=$preview.sourceCommit; archives=$results} | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'dotnet-archive-verification.json') -Encoding utf8
$results | Select-Object archive,entries,crcPassed,exactManifestHashes | ConvertTo-Json
