export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
          Roomy
        </h1>
        <p className="text-xl text-primary-500 mb-8">
          앱 없이 링크 하나로,
          <br />
          소규모 숙박업소를 위한 감성 객실 안내서
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/login" className="btn-primary">
            시작하기
          </a>
          <a href="/demo" className="btn-secondary">
            데모 보기
          </a>
        </div>
      </div>
    </main>
  );
}
