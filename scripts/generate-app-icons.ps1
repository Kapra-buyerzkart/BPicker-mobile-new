param(
  [Parameter(Mandatory = $true)]
  [string]$Source,
  [string]$AndroidResRoot = "android/app/src/main/res",
  [string]$iOSAppIconSet = "ios/BPicker/Images.xcassets/AppIcon.appiconset"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path $Source)) {
  throw "Source image not found: $Source"
}

Add-Type -AssemblyName System.Drawing

function New-DirectoryIfMissing([string]$Path) {
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Save-ResizedPng([System.Drawing.Image]$Image, [int]$Size, [string]$OutPath) {
  New-DirectoryIfMissing (Split-Path -Parent $OutPath)

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($Image, 0, 0, $Size, $Size)
    $bitmap.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

$img = [System.Drawing.Image]::FromFile((Resolve-Path $Source))
try {
  # Android launcher icons
  $androidTargets = @(
    @{ dir = "mipmap-mdpi"; size = 48 },
    @{ dir = "mipmap-hdpi"; size = 72 },
    @{ dir = "mipmap-xhdpi"; size = 96 },
    @{ dir = "mipmap-xxhdpi"; size = 144 },
    @{ dir = "mipmap-xxxhdpi"; size = 192 }
  )

  foreach ($t in $androidTargets) {
    $dirPath = Join-Path $AndroidResRoot $t.dir
    Save-ResizedPng -Image $img -Size $t.size -OutPath (Join-Path $dirPath "ic_launcher.png")
    Save-ResizedPng -Image $img -Size $t.size -OutPath (Join-Path $dirPath "ic_launcher_round.png")
  }

  # iOS AppIcon assets
  $iosTargets = @(
    @{ name = "AppIcon-20@2x.png"; size = 40 },
    @{ name = "AppIcon-20@3x.png"; size = 60 },
    @{ name = "AppIcon-29@2x.png"; size = 58 },
    @{ name = "AppIcon-29@3x.png"; size = 87 },
    @{ name = "AppIcon-40@2x.png"; size = 80 },
    @{ name = "AppIcon-40@3x.png"; size = 120 },
    @{ name = "AppIcon-60@2x.png"; size = 120 },
    @{ name = "AppIcon-60@3x.png"; size = 180 },
    @{ name = "AppIcon-1024.png"; size = 1024 }
  )

  foreach ($t in $iosTargets) {
    Save-ResizedPng -Image $img -Size $t.size -OutPath (Join-Path $iOSAppIconSet $t.name)
  }
} finally {
  $img.Dispose()
}

Write-Host "Done. Generated Android mipmap icons and iOS AppIcon assets from: $Source"

