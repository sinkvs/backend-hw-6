const fs = require('fs').promises;

// Демонстрация блокировки. Ставим таймер перед задачей
setTimeout(() => {
  console.log('Таймер сработал (запланирован на 100мс)');
}, 100);

// CPU-bound. Синхронная функция, блокирует поток
function runCpuTask() {
  console.time('CPU Task');
   let sum = 0;
   for (let i = 0; i < 1_000_000_000; i++) { sum += i; }
   console.timeEnd('CPU Task');
 }

// I/O-bound. Читаем 10 файлов параллельно, не блокирует поток
async function ioTest() {
  console.time('I/O Task');
  
  const files = [];
  for (let i = 1; i <= 10; i++) {
    files.push(fs.readFile(`src/tasks/event-loop/test-files/file_${i}.txt`, 'utf8'));
  }
  await Promise.all(files);
  
  console.timeEnd('I/O Task');
}

runCpuTask(); // Вызываем функцию
ioTest();

// Почему это так работает?
// CPU-bound (цикл) выполняется синхронно в одном потоке Node.js
// Пока цикл работает, Event Loop заморожен, обработать таймеры он не может
// Поэтому setTimeout срабатывает после завершения цикла.

// I/O-bound (чтение файлов) делегирует работу ОС. 
// Node.js продолжает выполнять код, что является неблокирующим вводом-выводом.