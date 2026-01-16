#!/bin/bash
# ===========================================
# Roomy - Ollama 설치 및 설정 스크립트
# ===========================================

set -e

echo "=========================================="
echo "Roomy - Ollama 설치 스크립트"
echo "=========================================="

# OS 감지
OS="$(uname -s)"
case "${OS}" in
    Linux*)     OS_TYPE=Linux;;
    Darwin*)    OS_TYPE=Mac;;
    MINGW*|MSYS*|CYGWIN*)    OS_TYPE=Windows;;
    *)          OS_TYPE="UNKNOWN:${OS}"
esac

echo "감지된 OS: ${OS_TYPE}"

# Ollama 설치
install_ollama() {
    echo ""
    echo "[1/4] Ollama 설치 중..."

    if command -v ollama &> /dev/null; then
        echo "✅ Ollama가 이미 설치되어 있습니다."
        ollama --version
    else
        case "${OS_TYPE}" in
            Linux)
                echo "Linux용 Ollama 설치 중..."
                curl -fsSL https://ollama.com/install.sh | sh
                ;;
            Mac)
                echo "Mac용 Ollama 설치 중..."
                if command -v brew &> /dev/null; then
                    brew install ollama
                else
                    curl -fsSL https://ollama.com/install.sh | sh
                fi
                ;;
            Windows)
                echo "Windows의 경우 https://ollama.com/download 에서 직접 설치해주세요."
                exit 1
                ;;
            *)
                echo "지원하지 않는 OS입니다."
                exit 1
                ;;
        esac
        echo "✅ Ollama 설치 완료!"
    fi
}

# Ollama 서버 시작
start_ollama() {
    echo ""
    echo "[2/4] Ollama 서버 시작 중..."

    # 이미 실행 중인지 확인
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama 서버가 이미 실행 중입니다."
    else
        echo "Ollama 서버를 백그라운드에서 시작합니다..."
        ollama serve > /dev/null 2>&1 &
        sleep 3

        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo "✅ Ollama 서버 시작 완료!"
        else
            echo "❌ Ollama 서버 시작 실패. 수동으로 'ollama serve'를 실행해주세요."
            exit 1
        fi
    fi
}

# 모델 다운로드
download_models() {
    echo ""
    echo "[3/4] AI 모델 다운로드 중..."

    # 한국어 지원 LLM 모델
    echo ""
    echo "LLM 모델 다운로드: qwen3:8b (한국어 지원, ~5GB)"
    echo "이 작업은 인터넷 속도에 따라 시간이 걸릴 수 있습니다..."
    ollama pull qwen3:8b
    echo "✅ qwen3:8b 다운로드 완료!"

    # 임베딩 모델
    echo ""
    echo "임베딩 모델 다운로드: nomic-embed-text (~275MB)"
    ollama pull nomic-embed-text
    echo "✅ nomic-embed-text 다운로드 완료!"
}

# 환경변수 안내
setup_env() {
    echo ""
    echo "[4/4] 환경변수 설정 안내"
    echo ""
    echo "=========================================="
    echo ".env 파일에 다음 설정이 필요합니다:"
    echo "=========================================="
    echo ""
    echo "# AI Provider를 ollama로 변경"
    echo "AI_PROVIDER=ollama"
    echo ""
    echo "# Ollama 설정 (기본값)"
    echo "OLLAMA_BASE_URL=http://localhost:11434"
    echo "OLLAMA_MODEL=qwen3:8b"
    echo "OLLAMA_EMBEDDING_MODEL=nomic-embed-text"
    echo "OLLAMA_NUM_CTX=8192"
    echo ""
    echo "=========================================="
}

# 설치 확인
verify_installation() {
    echo ""
    echo "=========================================="
    echo "설치 확인"
    echo "=========================================="

    echo ""
    echo "설치된 모델 목록:"
    ollama list

    echo ""
    echo "테스트 실행 중..."
    RESPONSE=$(ollama run qwen3:8b "안녕하세요" 2>/dev/null | head -1)
    if [ -n "$RESPONSE" ]; then
        echo "✅ LLM 테스트 성공!"
        echo "응답: $RESPONSE"
    else
        echo "❌ LLM 테스트 실패"
    fi
}

# 메인 실행
main() {
    install_ollama
    start_ollama
    download_models
    setup_env
    verify_installation

    echo ""
    echo "=========================================="
    echo "🎉 Ollama 설정 완료!"
    echo "=========================================="
    echo ""
    echo "다음 단계:"
    echo "1. .env 파일에서 AI_PROVIDER=ollama 로 변경"
    echo "2. 개발 서버 재시작: npm run dev"
    echo "3. AI 챗봇 테스트"
    echo ""
    echo "유용한 명령어:"
    echo "  ollama list          - 설치된 모델 목록"
    echo "  ollama run qwen3:8b  - 대화형 테스트"
    echo "  ollama serve         - 서버 시작"
    echo ""
}

# 실행
main
