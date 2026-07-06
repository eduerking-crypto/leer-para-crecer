import db from './database.js';
import bcrypt from 'bcryptjs';

db.exec('DELETE FROM game_scores; DELETE FROM reading_lists; DELETE FROM forum_posts; DELETE FROM forums; DELETE FROM events; DELETE FROM free_books; DELETE FROM books; DELETE FROM users;');

const hash = bcrypt.hashSync('demo123', 10);

// Users
const insertUser = db.prepare('INSERT INTO users (name, email, password, avatar, level, bio, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)');
insertUser.run('Ana López', 'ana@email.com', hash, '👩🏻‍💼', 12, 'Lectora apasionada, amante de la literatura latinoamericana.', 0);
insertUser.run('Carlos Ruiz', 'carlos@email.com', hash, '👨🏻‍💻', 8, 'Escritor y programador. Me encanta la ciencia ficción.', 0);
insertUser.run('María García', 'maria@email.com', hash, '👩🏻‍🏫', 15, 'Profesora de literatura. Club de lectura los viernes.', 0);
insertUser.run('Eduer Perez Castilla', 'eduerking@gmail.com', hash, '🦅', 99, 'Biólogo de la Universidad de Cartagena. Creador de Leer para Crecer.', 1);

// Regular books (picsum)
const books = [
  { title: 'El Poder del Ahora', author: 'Eckhart Tolle', genre: 'Autoayuda', desc: 'Una guía para la iluminación espiritual y vivir el momento presente.', rating: 4.7, pages: 236, year: 1997 },
  { title: 'Hábitos Atómicos', author: 'James Clear', genre: 'Productividad', desc: 'Cambios pequeños que generan resultados extraordinarios.', rating: 4.8, pages: 320, year: 2019 },
  { title: 'El Alquimista', author: 'Paulo Coelho', genre: 'Ficción', desc: 'La mágica historia de Santiago, un joven pastor en busca de su leyenda personal.', rating: 4.5, pages: 192, year: 1988 },
  { title: 'Piense y Hágase Rico', author: 'Napoleon Hill', genre: 'Finanzas', desc: 'Los 13 principios para alcanzar la riqueza y el éxito personal.', rating: 4.4, pages: 288, year: 1937 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'Historia', desc: 'Una breve historia de la humanidad, desde la prehistoria hasta la era digital.', rating: 4.6, pages: 512, year: 2011 },
  { title: '1984', author: 'George Orwell', genre: 'Ficción', desc: 'Una distopía sobre un mundo de vigilancia totalitaria y control mental.', rating: 4.6, pages: 328, year: 1949 },
  { title: 'El Monje que Vendió su Ferrari', author: 'Robin Sharma', genre: 'Autoayuda', desc: 'Un viaje espiritual hacia la realización personal y profesional.', rating: 4.3, pages: 198, year: 1997 },
  { title: 'Padre Rico, Padre Pobre', author: 'Robert Kiyosaki', genre: 'Finanzas', desc: 'Lo que los ricos enseñan a sus hijos sobre el dinero.', rating: 4.4, pages: 336, year: 1997 },
  { title: 'Breve Historia del Tiempo', author: 'Stephen Hawking', genre: 'Ciencia', desc: 'Los misterios del universo explicados por el genio de la física moderna.', rating: 4.5, pages: 256, year: 1988 },
  { title: 'El Poder de los Hábitos', author: 'Charles Duhigg', genre: 'Productividad', desc: 'Por qué hacemos lo que hacemos y cómo cambiarlo.', rating: 4.4, pages: 416, year: 2012 },
  { title: 'La Culpa es de la Vaca', author: 'Jaime Lopera', genre: 'Autoayuda', desc: 'Fábulas y reflexiones sobre el comportamiento humano.', rating: 4.1, pages: 180, year: 2003 },
  { title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', genre: 'Ficción', desc: 'La obra maestra del realismo mágico latinoamericano.', rating: 4.7, pages: 432, year: 1967 },
  { title: 'El Principito', author: 'Antoine de Saint-Exupéry', genre: 'Ficción', desc: 'Un cuento filosófico sobre el amor, la amistad y el sentido de la vida.', rating: 4.8, pages: 96, year: 1943 },
  { title: 'Inteligencia Emocional', author: 'Daniel Goleman', genre: 'Psicología', desc: 'La importancia de la inteligencia emocional para el éxito personal.', rating: 4.3, pages: 400, year: 1995 },
  { title: 'Freakonomics', author: 'Steven Levitt', genre: 'Economía', desc: 'Un economista revela el lado oculto de las cosas cotidianas.', rating: 4.2, pages: 336, year: 2005 },
  { title: 'El Arte de la Guerra', author: 'Sun Tzu', genre: 'Filosofía', desc: 'El clásico tratado sobre estrategia, liderazgo y superación.', rating: 4.4, pages: 96, year: -500 },
  { title: 'La Biblia de los Caídos', author: 'Fernando Trujillo', genre: 'Fantasía', desc: 'Una saga épica sobre el fin del mundo y la redención.', rating: 4.3, pages: 350, year: 2012 },
  { title: 'Outliers', author: 'Malcolm Gladwell', genre: 'Psicología', desc: 'Historias de éxito extraordinario y lo que realmente lo determina.', rating: 4.3, pages: 336, year: 2008 },
  { title: 'El Hombre en Busca de Sentido', author: 'Viktor Frankl', genre: 'Psicología', desc: 'La sobrecogedora experiencia de un psiquiatra en los campos de concentración.', rating: 4.7, pages: 200, year: 1946 },
  { title: 'El Jardín de los Cerezos', author: 'Antón Chéjov', genre: 'Teatro', desc: 'Una obra clásica sobre el cambio social y la pérdida de la tradición.', rating: 4.2, pages: 120, year: 1904 },
];

const insertBook = db.prepare('INSERT INTO books (title, author, genre, description, image_url, rating, pages, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
for (const b of books) {
  const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  insertBook.run(b.title, b.author, b.genre, b.desc, `https://picsum.photos/seed/${slug}/400/500`, b.rating, b.pages, b.year);
}

// Forums
const insertForum = db.prepare('INSERT INTO forums (title, description, icon, members, category) VALUES (?, ?, ?, ?, ?)');
insertForum.run('Desarrollo Personal', 'Compartamos estrategias para construir hábitos duraderos basados en los mejores libros.', '🧠', 248, 'Crecimiento');
insertForum.run('Club de Lectura Mensual', 'Cada mes elegimos un libro y discutimos juntos. Nuevo reto cada 30 días.', '📚', 156, 'Lectura');
insertForum.run('Escritura Creativa', 'Comparte tus propios textos, cuentos y reflexiones. Recibe feedback constructivo.', '✍️', 92, 'Arte');
insertForum.run('Ciencia y Tecnología', 'Discute los últimos avances científicos y libros de divulgación.', '🔬', 134, 'Ciencia');
insertForum.run('Filosofía y Pensamiento', 'Debates profundos sobre las grandes preguntas de la humanidad.', '🤔', 78, 'Filosofía');
insertForum.run('Arte y Literatura', 'Para los amantes del arte, la poesía y la gran literatura universal.', '🎭', 112, 'Arte');

// Events
const insertEvent = db.prepare('INSERT INTO events (title, type, event_date, description, color) VALUES (?, ?, ?, ?, ?)');
insertEvent.run('Club: El Alquimista', 'Discusión', '2026-07-15', 'Discutamos juntos esta obra maestra de Paulo Coelho.', 'emerald');
insertEvent.run('Taller de Escritura', 'Taller', '2026-07-22', 'Aprende técnicas narrativas con escritores profesionales.', 'violet');
insertEvent.run('Torneo de Quiz Literario', 'Juego', '2026-08-05', 'Compite contra otros lectores en nuestro quiz mensual.', 'amber');
insertEvent.run('Lectura Compartida: 1984', 'Evento', '2026-08-12', 'Leamos juntos y analicemos esta distopía de Orwell.', 'blue');
insertEvent.run('Reto: 12 Libros en 12 Meses', 'Reto', '2026-08-20', 'Nuevo reto de lectura para los próximos meses.', 'rose');
insertEvent.run('Maratón de Lectura', 'Reto', '2026-09-01', '24 horas de lectura continua. ¿Te animas?', 'emerald');

// Free books (curated from Project Gutenberg)
const insertFree = db.prepare(`INSERT INTO free_books (title, author, description, cover_url, source, source_id, read_url, text_url, genre, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const freeBooks = [
  { title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes Saavedra', desc: 'La obra cumbre de la literatura española. Las aventuras del ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza.', genre: 'Clásico', year: 1605, gid: 2000 },
  { title: 'La Divina Comedia', author: 'Dante Alighieri', desc: 'Viaje a través del Infierno, el Purgatorio y el Paraíso. Una de las obras maestras de la literatura universal.', genre: 'Poesía', year: 1320, gid: 8800 },
  { title: 'Crimen y Castigo', author: 'Fiódor Dostoyevski', desc: 'Un estudiante comete un asesinato y enfrenta las consecuencias psicológicas y morales de su acto.', genre: 'Novela', year: 1866, gid: 2554 },
  { title: 'El Origen de las Especies', author: 'Charles Darwin', desc: 'La obra fundamental de la biología moderna que presenta la teoría de la evolución por selección natural.', genre: 'Ciencia', year: 1859, gid: 22764 },
  { title: 'Orgullo y Prejuicio', author: 'Jane Austen', desc: 'La historia de Elizabeth Bennet y su complicada relación con el señor Darcy en la Inglaterra del siglo XIX.', genre: 'Novela', year: 1813, gid: 1342 },
  { title: 'Frankenstein', author: 'Mary Shelley', desc: 'El científico Victor Frankenstein crea una criatura que termina por convertirse en una pesadilla.', genre: 'Terror', year: 1818, gid: 84 },
  { title: 'Los Miserables', author: 'Victor Hugo', desc: 'Épica historia de exconvictos, revolucionarios y la búsqueda de la redención en el París del siglo XIX.', genre: 'Novela', year: 1862, gid: 135 },
  { title: 'El Príncipe', author: 'Nicolás Maquiavelo', desc: 'Tratado político sobre cómo gobernar y mantener el poder. Un clásico del pensamiento político.', genre: 'Filosofía', year: 1532, gid: 1232 },
  { title: 'Veinte Mil Leguas de Viaje Submarino', author: 'Julio Verne', desc: 'El Capitán Nemo y su submarino Nautilus exploran las profundidades del océano.', genre: 'Aventura', year: 1870, gid: 164 },
  { title: 'Alicia en el País de las Maravillas', author: 'Lewis Carroll', desc: 'Las fantásticas aventuras de Alicia en un mundo surrealista lleno de criaturas extraordinarias.', genre: 'Fantasía', year: 1865, gid: 11 },
  { title: 'Drácula', author: 'Bram Stoker', desc: 'La clásica historia de vampiros que sigue al Conde Drácula en su intento de expandir su reinado de terror.', genre: 'Terror', year: 1897, gid: 345 },
  { title: 'El Retrato de Dorian Gray', author: 'Oscar Wilde', desc: 'Un joven mantiene su juventud mientras su retrato envejece y muestra las marcas de sus pecados.', genre: 'Novela', year: 1890, gid: 174 },
  { title: 'Las Aventuras de Sherlock Holmes', author: 'Arthur Conan Doyle', desc: 'Doce relatos del famoso detective Sherlock Holmes y su amigo el Dr. Watson.', genre: 'Misterio', year: 1892, gid: 1661 },
  { title: 'La Guerra de los Mundos', author: 'H.G. Wells', desc: 'La Tierra es invadida por marcianos en esta obra fundacional de la ciencia ficción.', genre: 'Ciencia Ficción', year: 1898, gid: 36 },
  { title: 'Moby Dick', author: 'Herman Melville', desc: 'La obsesiva búsqueda del capitán Ahab por la ballena blanca que le arrebató una pierna.', genre: 'Aventura', year: 1851, gid: 2701 },
  { title: 'Las Flores del Mal', author: 'Charles Baudelaire', desc: 'Colección de poemas que exploran la belleza en lo oscuro y lo prohibido de la vida urbana.', genre: 'Poesía', year: 1857, gid: 6098 },
  { title: 'El Arte de la Guerra', author: 'Sun Tzu', desc: 'Antiguo tratado militar chino sobre estrategia, liderazgo y superación personal.', genre: 'Filosofía', year: -500, gid: 132 },
  { title: 'La Ilíada', author: 'Homero', desc: 'El poema épico de la Guerra de Troya y la cólera de Aquiles, el más grande de los guerreros griegos.', genre: 'Poesía', year: -750, gid: 6130 },
  { title: 'La Odisea', author: 'Homero', desc: 'El viaje de regreso de Odiseo a su hogar en Ítaca después de la Guerra de Troya.', genre: 'Poesía', year: -725, gid: 1727 },
  { title: 'El Profeta', author: 'Khalil Gibran', desc: 'Poemas filosóficos sobre el amor, el matrimonio, los hijos, el trabajo y la libertad.', genre: 'Filosofía', year: 1923, gid: 58585 },
];

for (const fb of freeBooks) {
  const slug = fb.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  insertFree.run(
    fb.title, fb.author, fb.desc,
    `https://picsum.photos/seed/gutenberg-${fb.gid}/400/500`,
    'gutenberg', String(fb.gid),
    `https://www.gutenberg.org/ebooks/${fb.gid}`,
    `https://www.gutenberg.org/files/${fb.gid}/${fb.gid}-0.txt`,
    fb.genre, fb.year
  );
}

console.log('✅ Base de datos sembrada con éxito');
console.log(`  - ${books.length} libros comerciales`);
console.log(`  - ${freeBooks.length} libros gratuitos (Gutenberg)`);
console.log('  - 4 usuarios (admin: eduerking@gmail.com / demo123, demo: ana@email.com / demo123)');
console.log('  - 6 foros');
console.log('  - 6 eventos');
