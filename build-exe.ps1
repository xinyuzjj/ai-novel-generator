# 一键构建和打包AI小说生成器的PowerShell脚本
# 此脚本会构建应用程序并生成可分发的exe安装包

Write-Host "=============================================" -ForegroundColor Green
Write-Host "        AI小说生成器一键构建脚本        " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# 检查是否在正确的目录
if (-not (Test-Path "package.json")) {
    Write-Host "错误: 请在项目根目录运行此脚本!" -ForegroundColor Red
    Write-Host "请切换到包含 package.json 的目录后再运行" -ForegroundColor Yellow
    Read-Host "按任意键退出..."
    exit 1
}

# 检查Node.js是否安装
Write-Host "检查Node.js安装情况..." -ForegroundColor Cyan
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到Node.js，请先安装Node.js!" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按任意键退出..."
    exit 1
}

# 检查npm是否安装
Write-Host "检查npm安装情况..." -ForegroundColor Cyan
try {
    $npmVersion = npm -v
    Write-Host "✓ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到npm，请先安装Node.js!" -ForegroundColor Red
    Read-Host "按任意键退出..."
    exit 1
}

# 安装依赖
Write-Host "安装项目依赖..." -ForegroundColor Cyan
try {
    npm install
    Write-Host "✓ 依赖安装成功!" -ForegroundColor Green
} catch {
    Write-Host "错误: 依赖安装失败!" -ForegroundColor Red
    Read-Host "按任意键退出..."
    exit 1
}

# 构建应用程序
Write-Host "构建应用程序..." -ForegroundColor Cyan
try {
    npm run dist
    Write-Host "✓ 应用程序构建成功!" -ForegroundColor Green
} catch {
    Write-Host "错误: 应用程序构建失败!" -ForegroundColor Red
    Read-Host "按任意键退出..."
    exit 1
}

# 检查构建结果
Write-Host "检查构建结果..." -ForegroundColor Cyan
if (Test-Path "build") {
    $buildFiles = Get-ChildItem "build" | Where-Object { $_.Extension -eq ".exe" -or $_.Extension -eq ".nsis" }
    if ($buildFiles.Count -gt 0) {
        Write-Host "✓ 构建结果:"
        $buildFiles | ForEach-Object {
            Write-Host "  - $($_.Name) (大小: $([math]::Round($_.Length / 1MB, 2)) MB)" -ForegroundColor Green
        }
        
        # 显示构建目录
        $buildPath = Resolve-Path "build"
        Write-Host "`n✓ 构建文件位置: $buildPath" -ForegroundColor Green
        Write-Host "`n你可以将这些exe文件发送给别人使用!" -ForegroundColor Green
        Write-Host "`n注意: 首次运行时可能需要管理员权限来安装。" -ForegroundColor Yellow
    } else {
        Write-Host "错误: 未找到构建的exe文件!" -ForegroundColor Red
    }
} else {
    Write-Host "错误: 构建目录不存在!" -ForegroundColor Red
}

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "          构建过程完成!          " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# 询问是否打开构建目录
$openBuildDir = Read-Host "是否打开构建目录查看结果? (y/n)"
if ($openBuildDir -eq "y" -or $openBuildDir -eq "Y") {
    if (Test-Path "build") {
        Invoke-Item "build"
    } else {
        Write-Host "构建目录不存在!" -ForegroundColor Red
    }
}

Read-Host "按任意键退出..."