$ErrorActionPreference = "Stop"

function Fail($msg) {
    Write-Host ""
    Write-Host "ОШИБКА: $msg" -ForegroundColor Red
    Write-Host ""
    Read-Host "Нажми Enter для выхода"
    exit 1
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (!(Test-Path "index.html")) { Fail "Положи этот пакет в КОРЕНЬ rpc-order-website, рядом с index.html и app.js." }
if (!(Test-Path "app.js")) { Fail "Не найден app.js." }

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = "_rpc_backup_before_remove_accounts_$stamp"
New-Item -ItemType Directory -Path $backup | Out-Null

$toBackup = @(
    "index.html",
    "app.js",
    "auth.js",
    "auth-config.js",
    "AUTH_SETUP.txt",
    "SUPABASE_ACCOUNT_SETUP.sql"
)
foreach ($f in $toBackup) {
    if (Test-Path $f) {
        Copy-Item $f (Join-Path $backup $f) -Force
    }
}

Write-Host "1/5 Резервная копия создана: $backup" -ForegroundColor Cyan

# ---------------- INDEX.HTML ----------------
$index = Get-Content "index.html" -Raw -Encoding UTF8
$beforeIndex = $index

# Удаляем auth.js, но оставляем auth-config.js как публичный Supabase data config.
$index = $index -replace '(?m)^\s*<script defer src="auth\.js\?v=\d+"></script>\s*\r?\n?', ''

# Десктопная кнопка аккаунта.
$index = [regex]::Replace(
    $index,
    '(?s)\s*<button class="account-entry sidebar-account"[^>]*>.*?</button>\s*(?=<nav class="nav">)',
    "`r`n"
)

# Мобильная кнопка аккаунта.
$index = [regex]::Replace(
    $index,
    '(?s)<div class="mobile-controls">\s*<button class="mobile-account-button"[^>]*>.*?</button>\s*',
    '<div class="mobile-controls">'
)

# Блок загрузки фото к отзыву был привязан к аккаунту — удаляем его.
$index = [regex]::Replace(
    $index,
    '(?s)\s*<div class="review-media-upload">.*?</div>\s*(?=<input aria-hidden="true")',
    "`r`n"
)

# Полностью удаляем модальное окно входа / регистрации / личного кабинета.
$index = [regex]::Replace(
    $index,
    '(?s)\s*<div aria-hidden="true" aria-label="Аккаунт RPC"[^>]*>.*?</div>\s*(?=<footer>)',
    "`r`n"
)

if ($index -eq $beforeIndex) {
    Fail "index.html не изменился. Возможно, структура сайта уже другая."
}

Set-Content "index.html" $index -Encoding UTF8
Write-Host "2/5 Удалён интерфейс аккаунтов из index.html" -ForegroundColor Green

# ---------------- AUTH-CONFIG -> PUBLIC DATA CONFIG ----------------
if (Test-Path "auth-config.js") {
    $cfg = Get-Content "auth-config.js" -Raw -Encoding UTF8

    $urlMatch = [regex]::Match($cfg, 'supabaseUrl:\s*"([^"]+)"')
    $keyMatch = [regex]::Match($cfg, 'supabasePublishableKey:\s*"([^"]+)"')

    if ($urlMatch.Success -and $keyMatch.Success) {
        $url = $urlMatch.Groups[1].Value
        $key = $keyMatch.Groups[1].Value

        $newCfg = @"
"use strict";

/**
 * RPC public data configuration.
 * Используется только для публичных данных сайта:
 * портфолио и опубликованных медиа отзывов.
 * Системы аккаунтов на сайте больше нет.
 */
window.RPC_AUTH_CONFIG = Object.freeze({
  supabaseUrl: "$url",
  supabasePublishableKey: "$key"
});
"@
        Set-Content "auth-config.js" $newCfg -Encoding UTF8
    } else {
        Fail "Не удалось прочитать публичные Supabase URL/Publishable Key из auth-config.js."
    }
}

Write-Host "3/5 auth-config.js оставлен только как публичный data-config" -ForegroundColor Green

# ---------------- APP.JS ----------------
$app = Get-Content "app.js" -Raw -Encoding UTF8
$beforeApp = $app

# Заказы больше не содержат accountId/accountEmail/accountAvatar.
$app = [regex]::Replace(
    $app,
    '(?s)\s*const authUser=window\.RPC_AUTH\?\.user;\s*if\(authUser\)\{const meta=authUser\.user_metadata\|\|\{\};payload\.set\("accountId".*?payload\.set\("accountAvatar",meta\.rpc_avatar_url\|\|meta\.avatar_url\|\|meta\.picture\|\|""\);\}',
    ''
)

# Быстрый публичный Supabase-клиент без ожидания аккаунта.
$oldClientPattern = '(?s)function wait\(ms\)\{return new Promise\(resolve=>setTimeout\(resolve,ms\)\);\}\s*async function getDataClient\(\{authenticated=false\}=\{\}\)\{.*?\n\}'
$newClient = @'
async function getDataClient(){
  if(rpcDataClient)return rpcDataClient;
  const config=window.RPC_AUTH_CONFIG;
  if(window.supabase?.createClient&&config?.supabaseUrl&&config?.supabasePublishableKey){
    rpcDataClient=window.supabase.createClient(config.supabaseUrl,config.supabasePublishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    return rpcDataClient;
  }
  return null;
}
'@
$app = [regex]::Replace($app, $oldClientPattern, $newClient, 1)

# Убираем DOM-ссылки и состояние загрузки фото отзывов.
$app = [regex]::Replace(
    $app,
    '(?m)^const reviewFilesInput=document\.getElementById\("reviewFiles"\),reviewMediaPreview=document\.getElementById\("reviewMediaPreview"\),reviewMediaHint=document\.getElementById\("reviewMediaHint"\);\s*\r?\n',
    ''
)
$app = $app.Replace(
    'let reviewsLoaded=false,latestReviews=[],reviewMediaMap=new Map(),selectedReviewFiles=[],portfolioLoaded=false,rpcDataClient=null;',
    'let reviewsLoaded=false,latestReviews=[],reviewMediaMap=new Map(),portfolioLoaded=false,rpcDataClient=null;'
)

# Удаляем весь клиентский модуль загрузки фото отзывов, до обработчика отправки формы.
$app = [regex]::Replace(
    $app,
    '(?s)function reviewMimeFromBytes\(bytes\)\{.*?(?=reviewForm\?\.addEventListener\("submit",async event=>\{)',
    ''
)

# Убираем auth-метаданные из отправки отзыва.
$app = [regex]::Replace(
    $app,
    '(?s)(reviewSubmit\.disabled=true;reviewSubmit\.textContent=t\("sending"\);const data=Object\.fromEntries\(new FormData\(reviewForm\)\.entries\(\)\);data\.turnstileToken=reviewTurnstileToken;data\.language=currentLanguage;).*?(?=\s*let mediaDraft=null;)',
    '$1'
)

# Убираем mediaDraft-загрузку, потому что она была доступна только аккаунтам.
$app = [regex]::Replace(
    $app,
    '(?s)\s*let mediaDraft=null;\s*try\{\s*mediaDraft=await createReviewMediaDraft\(data\);\s*if\(mediaDraft\)\{.*?\}\s*(?=const response=await fetch)',
    "`r`n  try{`r`n    "
)

$app = [regex]::Replace(
    $app,
    '(?s)\s*if\(mediaDraft&&result\.published\)\{.*?\}\s*(?=reviewStatus\.className="form-status success")',
    "`r`n    "
)

$app = $app.Replace('reviewForm.reset();clearReviewFiles();', 'reviewForm.reset();')
$app = [regex]::Replace(
    $app,
    '\}catch\(error\)\{console\.error\(error\);if\(mediaDraft\)await cleanupReviewMediaDraft\(mediaDraft\);',
    '}catch(error){console.error(error);'
)
$app = $app.Replace(
    'finally{reviewSubmit.textContent=t("submitReview");updateReviewSubmitState();renderReviewFilePreviews();}',
    'finally{reviewSubmit.textContent=t("submitReview");updateReviewSubmitState();}'
)

# Удаляем вызовы UI загрузки фото, которого больше нет.
$app = [regex]::Replace($app, '(?m)^\s*renderReviewFilePreviews\(\);\s*\r?\n', '')
$app = $app.Replace('  renderReviewFilePreviews();' + "`r`n", '')
$app = $app.Replace('  renderReviewFilePreviews();' + "`n", '')

# Удаляем строки локализации, относящиеся только к аккаунтной загрузке фото.
$app = [regex]::Replace($app, '(?m)^\s*reviewMediaLogin:\s*"[^"]*",\s*\r?\n', '')
$app = [regex]::Replace($app, '(?m)^\s*"Для прикрепления фотографий требуется вход в аккаунт RPC\.":\s*"[^"]*",\s*\r?\n', '')

Set-Content "app.js" $app -Encoding UTF8
Write-Host "4/5 Удалена логика аккаунтов из app.js" -ForegroundColor Green

# ---------------- DELETE ACCOUNT FILES ----------------
$remove = @(
    "auth.js",
    "AUTH_SETUP.txt",
    "SUPABASE_ACCOUNT_SETUP.sql"
)
foreach ($f in $remove) {
    if (Test-Path $f) {
        Remove-Item $f -Force
    }
}

# Финальная проверка пользовательского интерфейса.
$checkIndex = Get-Content "index.html" -Raw -Encoding UTF8
if ($checkIndex -match 'data-rpc-auth-open|id="rpcAuthModal"|src="auth\.js') {
    Fail "После обработки в index.html остались активные элементы аккаунтов. Восстанови файлы из $backup и пришли мне index.html."
}

Write-Host "5/5 Готово. Система аккаунтов удалена." -ForegroundColor Green
Write-Host ""
Write-Host "Удалено:" -ForegroundColor Yellow
Write-Host " - вход / регистрация"
Write-Host " - OTP"
Write-Host " - Discord OAuth для аккаунтов"
Write-Host " - личный кабинет"
Write-Host " - аватары аккаунтов"
Write-Host " - привязка заказов/отзывов к аккаунту"
Write-Host " - загрузка фото к отзывам (она зависела от аккаунта)"
Write-Host ""
Write-Host "Оставлено:" -ForegroundColor Yellow
Write-Host " - заказы"
Write-Host " - обычные отзывы"
Write-Host " - портфолио"
Write-Host " - статистика"
Write-Host " - Supabase для публичных данных"
Write-Host ""
Write-Host "Резервная копия: $backup"
Write-Host ""
Read-Host "Нажми Enter"
