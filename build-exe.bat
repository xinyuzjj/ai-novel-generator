@echo off
chcp 65001 >nul

:: 一键构建和打包AI小说生成器的批处理脚本
:: 此脚本会构建应用程序并生成可分发的exe安装包

echo =============================================
echo         AI小说生成器一键构建脚本         
echo =============================================

:: 检查是否在正确的目录
if not exist "package.json" (
    echo 错误: 请在项目根目录运行此脚本!
    echo 请切换到包含 package.json 的目录后再运行
    pause
    exit /b 1
)

:: 检查Node.js是否安装
echo 检查Node.js安装情况...
try {
    node -v >nul 2>nul
    if %errorlevel% equ 0 (
        for /f "delims=" %%i in ('node -v') do set NODE_VERSION=%%i
        echo ✓ Node.js 版本: %NODE_VERSION%
    ) else (
        echo 错误: 未找到Node.js，请先安装Node.js!
        echo 下载地址: https://nodejs.org/
        pause
        exit /b 1
    )
} catch {
    echo 错误: 未找到Node.js，请先安装Node.js!
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
}

:: 检查npm是否安装
echo 检查npm安装情况...
try {
    npm -v >nul 2>nul
    if %errorlevel% equ 0 (
        for /f "delims=" %%i in ('npm -v') do set NPM_VERSION=%%i
        echo ✓ npm 版本: %NPM_VERSION%
    ) else (
        echo 错误: 未找到npm，请先安装Node.js!
        pause
        exit /b 1
    )
} catch {
    echo 错误: 未找到npm，请先安装Node.js!
    pause
    exit /b 1
}

:: 安装依赖
echo 安装项目依赖...
npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败!
    pause
    exit /b 1
) else (
    echo ✓ 依赖安装成功!
)

:: 构建应用程序
echo 构建应用程序...
npm run dist
if %errorlevel% neq 0 (
    echo 错误: 应用程序构建失败!
    pause
    exit /b 1
) else (
    echo ✓ 应用程序构建成功!
)

:: 检查构建结果
echo 检查构建结果...
if exist "build" (
    dir "build\*.exe" >nul 2>nul
    if %errorlevel% equ 0 (
        echo ✓ 构建结果:
        for /f "delims=" %%i in ('dir /b "build\*.exe"') do (
            for /f "tokens=3" %%j in ('dir "build\%%i" ^| findstr "字节"') do set FILE_SIZE=%%j
            echo   - %%i (大小: %FILE_SIZE%)
        )
        
        :: 显示构建目录
        for /f "delims=" %%i in ('cd') do set CURRENT_DIR=%%i
        echo.
        echo ✓ 构建文件位置: %CURRENT_DIR%\build
        echo.
        echo 你可以将这些exe文件发送给别人使用!
        echo.
        echo 注意: 首次运行时可能需要管理员权限来安装。
    ) else (
        echo 错误: 未找到构建的exe文件!
    )
) else (
    echo 错误: 构建目录不存在!
)

echo.
echo =============================================
echo           构建过程完成!           
echo =============================================

:: 询问是否打开构建目录
echo.
echo 是否打开构建目录查看结果? (y/n)
set /p OPEN_DIR=
if /i "%OPEN_DIR%"=="y" (
    if exist "build" (
        start "" "build"
    ) else (
        echo 构建目录不存在!
    )
)

echo.
pause