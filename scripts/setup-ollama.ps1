# ===========================================
# Roomy - Ollama 설치 및 설정 스크립트 (Windows PowerShell)
# ===========================================

Write-Host "=========================================="
Write-Host "Roomy - Ollama 설치 스크립트 (Windows)"
Write-Host "=========================================="

# Ollama 설치 확인
function Install-Ollama {
    Write-Host ""
    Write-Host "[1/4] Ollama 설치 확인 중..."

    $ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue

    if ($ollamaPath) {
        Write-Host "✅ Ollama가 이미 설치되어 있습니다."
        ollama --version
    } else {
        Write-Host "Ollama가 설치되어 있지 않습니다."
        Write-Host ""
        Write-Host "다음 단계를 따라 설치해주세요:"
        Write-Host "1. https://ollama.com/download 방문"
        Write-Host "2. Windows 버전 다운로드 및 설치"
        Write-Host "3. 설치 완료 후 이 스크립트 다시 실행"
        Write-Host ""

        $response = Read-Host "Ollama 다운로드 페이지를 열까요? (y/n)"
        if ($response -eq 'y') {
            Start-Process "https://ollama.com/download"
        }
        exit 1
    }
}

# Ollama 서버 확인
function Start-OllamaServer {
    Write-Host ""
    Write-Host "[2/4] Ollama 서버 확인 중..."

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "✅ Ollama 서버가 실행 중입니다."
    } catch {
        Write-Host "Ollama 서버가 실행되고 있지 않습니다."
        Write-Host "새 터미널에서 'ollama serve' 명령을 실행해주세요."
        Write-Host ""
        Write-Host "또는 Ollama 앱을 시작해주세요."

        $response = Read-Host "계속하시겠습니까? (y/n)"
        if ($response -ne 'y') {
            exit 1
        }
    }
}

# 모델 다운로드
function Download-Models {
    Write-Host ""
    Write-Host "[3/4] AI 모델 다운로드 중..."

    # LLM 모델
    Write-Host ""
    Write-Host "LLM 모델 다운로드: qwen3:8b (한국어 지원, ~5GB)"
    Write-Host "이 작업은 인터넷 속도에 따라 시간이 걸릴 수 있습니다..."
    ollama pull qwen3:8b
    Write-Host "✅ qwen3:8b 다운로드 완료!"

    # 임베딩 모델
    Write-Host ""
    Write-Host "임베딩 모델 다운로드: nomic-embed-text (~275MB)"
    ollama pull nomic-embed-text
    Write-Host "✅ nomic-embed-text 다운로드 완료!"
}

# 환경변수 안내
function Show-EnvSetup {
    Write-Host ""
    Write-Host "[4/4] 환경변수 설정 안내"
    Write-Host ""
    Write-Host "=========================================="
    Write-Host ".env 파일에 다음 설정이 필요합니다:"
    Write-Host "=========================================="
    Write-Host ""
    Write-Host "# AI Provider를 ollama로 변경"
    Write-Host "AI_PROVIDER=ollama"
    Write-Host ""
    Write-Host "# Ollama 설정 (기본값)"
    Write-Host "OLLAMA_BASE_URL=http://localhost:11434"
    Write-Host "OLLAMA_MODEL=qwen3:8b"
    Write-Host "OLLAMA_EMBEDDING_MODEL=nomic-embed-text"
    Write-Host "OLLAMA_NUM_CTX=8192"
    Write-Host ""
    Write-Host "=========================================="
}

# 설치 확인
function Verify-Installation {
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "설치 확인"
    Write-Host "=========================================="

    Write-Host ""
    Write-Host "설치된 모델 목록:"
    ollama list

    Write-Host ""
    Write-Host "테스트는 수동으로 실행해주세요:"
    Write-Host "  ollama run qwen3:8b"
    Write-Host '  > 안녕하세요'
}

# 완료 메시지
function Show-Completion {
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "🎉 Ollama 설정 완료!"
    Write-Host "=========================================="
    Write-Host ""
    Write-Host "다음 단계:"
    Write-Host "1. .env 파일에서 AI_PROVIDER=ollama 로 변경"
    Write-Host "2. 개발 서버 재시작: npm run dev"
    Write-Host "3. AI 챗봇 테스트"
    Write-Host ""
    Write-Host "유용한 명령어:"
    Write-Host "  ollama list          - 설치된 모델 목록"
    Write-Host "  ollama run qwen3:8b  - 대화형 테스트"
    Write-Host "  ollama serve         - 서버 시작"
    Write-Host ""
}

# 메인 실행
Install-Ollama
Start-OllamaServer
Download-Models
Show-EnvSetup
Verify-Installation
Show-Completion
