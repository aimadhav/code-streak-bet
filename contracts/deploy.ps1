# Deploy LeetCode Challenge Contract to Stellar Testnet
# Run this script to deploy the contract

Write-Host "🚀 Deploying LeetCode Challenge Contract..." -ForegroundColor Green

# Check if contract is built
$wasmPath = "target/wasm32-unknown-unknown/release/leetcode_challenge_contract.wasm"
if (-not (Test-Path $wasmPath)) {
    Write-Host "❌ Contract not built! Run: cargo build --target wasm32-unknown-unknown --release" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Contract WASM found: $wasmPath" -ForegroundColor Green

# Deploy contract
Write-Host "`n📝 Deploying contract to testnet..." -ForegroundColor Cyan
Write-Host "You'll need your Stellar secret key. Get it from Freighter wallet." -ForegroundColor Yellow

$secretKey = Read-Host "Enter your Stellar SECRET key (starts with S)"

if ($secretKey -notmatch '^S[A-Z0-9]{55}$') {
    Write-Host "❌ Invalid secret key format!" -ForegroundColor Red
    exit 1
}

try {
    # Deploy
    $contractId = stellar contract deploy `
        --wasm $wasmPath `
        --source $secretKey `
        --network testnet 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Contract deployed successfully!" -ForegroundColor Green
        Write-Host "📋 Contract ID: $contractId" -ForegroundColor Cyan
        
        # Save to file
        $contractId | Out-File "contract_id.txt"
        Write-Host "💾 Contract ID saved to contract_id.txt" -ForegroundColor Green
        
        # Initialize contract
        Write-Host "`n🔧 Initializing contract..." -ForegroundColor Cyan
        
        $publicKey = Read-Host "Enter your Stellar PUBLIC key (starts with G)"
        
        stellar contract invoke `
            --id $contractId `
            --source $secretKey `
            --network testnet `
            -- initialize `
            --admin $publicKey `
            --platform_address $publicKey
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Contract initialized!" -ForegroundColor Green
            Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
            Write-Host "1. Copy this contract ID: $contractId"
            Write-Host "2. Update src/lib/config.ts:"
            Write-Host "   VITE_CHALLENGE_CONTRACT_ADDRESS=$contractId"
            Write-Host "3. Add to .env file"
            Write-Host "4. Restart frontend: npm run dev"
        } else {
            Write-Host "❌ Failed to initialize contract" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to deploy contract" -ForegroundColor Red
        Write-Host $contractId
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
