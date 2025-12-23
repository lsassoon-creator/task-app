const Footer = () => {
  return (
    <footer className="bg-transparent text-white/80 py-6 relative z-20">
      <div className="container mx-auto px-4 text-center text-sm">
        <p className="flex items-center justify-center gap-2">
          <span>Task App by Pixegami</span>
          <span className="text-yellow-400">⚡</span>
          <a
            href="https://github.com/pixegami/task-app-project"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-400 transition-colors duration-300"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
