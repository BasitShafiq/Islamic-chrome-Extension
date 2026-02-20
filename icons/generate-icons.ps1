# Generate PNG icons for FocusFlow Extension
# Run this script with PowerShell to create the icon files

# Ensure we're in the right directory
$iconDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $iconDir) { $iconDir = "." }

# Create a simple colored PNG using .NET
Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param(
        [int]$Size,
        [string]$OutputPath
    )
    
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Enable anti-aliasing
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Create purple gradient brush
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect, 
        [System.Drawing.Color]::FromArgb(255, 99, 102, 241),  # #6366F1
        [System.Drawing.Color]::FromArgb(255, 79, 70, 229),   # #4F46E5
        45
    )
    
    # Draw rounded rectangle background
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = [int]($Size * 0.2)
    $path.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
    $path.AddArc($Size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
    $path.AddArc($Size - $radius * 2, $Size - $radius * 2, $radius * 2, $radius * 2, 0, 90)
    $path.AddArc(0, $Size - $radius * 2, $radius * 2, $radius * 2, 90, 90)
    $path.CloseFigure()
    
    $graphics.FillPath($brush, $path)
    
    # Draw white target circle
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [int]($Size * 0.08))
    $circleSize = [int]($Size * 0.55)
    $circleOffset = ($Size - $circleSize) / 2
    $graphics.DrawEllipse($pen, $circleOffset, $circleOffset, $circleSize, $circleSize)
    
    # Draw center dot
    $dotSize = [int]($Size * 0.15)
    $dotOffset = ($Size - $dotSize) / 2
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $graphics.FillEllipse($whiteBrush, $dotOffset, $dotOffset, $dotSize, $dotSize)
    
    # Save as PNG
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $pen.Dispose()
    $whiteBrush.Dispose()
    
    Write-Host "Created: $OutputPath"
}

# Generate all icon sizes
Create-Icon -Size 16 -OutputPath "$iconDir\icon16.png"
Create-Icon -Size 48 -OutputPath "$iconDir\icon48.png"
Create-Icon -Size 128 -OutputPath "$iconDir\icon128.png"

Write-Host "`nAll icons generated successfully!"
