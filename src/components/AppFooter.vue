<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-left">
        <div class="footer-logo">
          <span class="footer-logo-icon">🔭</span>
          <span class="footer-logo-text">Астрофото Админ</span>
        </div>
        <div class="footer-copyright">
          © 2026 Админ панель сервиса астрофотографии
        </div>
      </div>
      
      <div class="footer-right">
        <a href="#" class="footer-link">Документация</a>
        <a href="#" class="footer-link">Поддержка</a>
        <a href="#" class="footer-link">GitHub</a>
        <a href="#" class="footer-link">Связаться с нами</a>
        <span class="footer-version">Версия: 1.0.0</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #111827;
  border-top: 1px solid rgba(59, 130, 246, 0.3);
  padding: 1.25rem 1.5rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-logo-icon {
  font-size: 1.2rem;
}

.footer-logo-text {
  font-weight: 600;
  color: #cbd5e1;
}

.footer-copyright {
  opacity: 0.7;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.footer-link {
  color: #93c5fd;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #bfdbfe;
  text-decoration: underline;
}

.footer-version {
  opacity: 0.5;
  margin-left: 1rem;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-left,
  .footer-right {
    justify-content: center;
  }
}
</style>