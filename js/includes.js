window.loadIncludes = async function loadIncludes() {
  const includeNodes = document.querySelectorAll('[data-include]');
  const tasks = Array.from(includeNodes).map(async (node) => {
    const path = node.getAttribute('data-include');
    if (!path) return;
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      node.innerHTML = html;
    } catch (error) {
      console.warn(`Nepodařilo se načíst fragment ${path}`, error);
      node.innerHTML = '';
    }
  });
  await Promise.all(tasks);
};
