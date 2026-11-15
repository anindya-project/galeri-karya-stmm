/* Logika layar Detail Karya */

(function () {
  const kontenEl = document.getElementById('konten-detail');
  const tombolBagikanAtas = document.getElementById('tombol-bagikan-atas');

  // 1) Ambil id karya dari URL (?id=1)
  const idKarya = ambilParameter('id');
  const karya = idKarya ? cariKarya(idKarya) : null;

  // Pasang tombol kembali di bilah atas
  pasangTombolKembali('tombol-kembali');

  // 2) Bila id tidak ada atau karya tidak ditemukan: tampilkan pesan ramah
  if (!karya) {
    if (tombolBagikanAtas) tombolBagikanAtas.style.display = 'none';

    kontenEl.innerHTML = `
      <div class="konten">
        <div class="pesan-kosong">
          <strong>Karya Tidak Ditemukan</strong>
          <p class="teks-redup">Karya yang kamu cari tidak ditemukan atau tautan salah.</p>
          <a href="index.html" class="tombol tombol--utama">Kembali ke Beranda</a>
        </div>
      </div>`;
    return;
  }

  // 3) Ambil data kreator
  const kreator = cariKreator(karya.kreatorId) || {
    id: '',
    nama: 'Mahasiswa STMM',
    prodi: 'Multimedia',
    angkatan: karya.tahun || 2024,
    bio: ''
  };

  // Perbarui judul halaman
  document.title = `${karya.judul} · Galeri Karya STMM`;

  // Pasang tombol bagikan di bilah atas
  if (tombolBagikanAtas) {
    tombolBagikanAtas.innerHTML = ikon('bagikan', 22);
    tombolBagikanAtas.addEventListener('click', () => bagikanKarya(karya));
  }

  // Label kategori (khusus Film ditampilkan sebagai Film Pendek sesuai desain)
  const labelKategori = karya.kategori === 'Film' ? 'Film Pendek' : karya.kategori;
  const satuanDurasi = (KATEGORI[karya.kategori] && KATEGORI[karya.kategori].satuan) || 'Durasi';

  // Link YouTube
  const youtubeUrl = karya.youtubeId
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(karya.youtubeId)}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(karya.judul + ' STMM')}`;

  // Karya lain dari kreator yang sama (selain karya saat ini)
  const karyaLain = karyaMilik(kreator.id).filter((k) => String(k.id) !== String(karya.id));

  // 4) Render tampilan detail karya sesuai desain
  kontenEl.innerHTML = `
    <!-- Pemutar Media / Video Tersemat -->
    <div class="pemutar-media" id="area-pemutar" style="${gayaKategori(karya.kategori)}">
      <button class="pemutar-media__tombol" id="tombol-putar" type="button" aria-label="Putar video">
        ${IKON_PUTAR}
      </button>
      <span class="pemutar-media__info">Video tersemat dari YouTube</span>
    </div>

    <div class="konten">
      <!-- Tag Kategori & Genre serta Judul Karya -->
      <section class="detail-kepala">
        <div class="detail-tag">
          <span class="tag-pill tag-pill--kategori" style="${gayaKategori(karya.kategori)}">${aman(labelKategori)}</span>
          <span class="tag-pill tag-pill--genre">${aman(karya.genre)}</span>
        </div>
        <h1 class="detail-judul">${aman(karya.judul)}</h1>
      </section>

      <!-- Kartu Kreator -->
      <section class="kartu-kreator">
        <div class="kartu-kreator__avatar">${aman(inisial(kreator.nama))}</div>
        <div class="kartu-kreator__info">
          <strong class="kartu-kreator__nama">${aman(kreator.nama)}</strong>
          <span class="kartu-kreator__sub">${aman(kreator.prodi)} · Angkatan ${kreator.angkatan}</span>
        </div>
        <span class="kartu-kreator__tautan" role="button" tabindex="0">Profil</span>
      </section>

      <!-- Sinopsis -->
      <p class="teks-isi">${aman(karya.sinopsis)}</p>

      <!-- Grid Metadata (Tahun, Durasi, Mata Kuliah) -->
      <section class="grid-meta">
        <div class="kartu-meta">
          <span class="kartu-meta__label">Tahun</span>
          <strong class="kartu-meta__nilai">${karya.tahun}</strong>
        </div>
        <div class="kartu-meta">
          <span class="kartu-meta__label">${aman(satuanDurasi)}</span>
          <strong class="kartu-meta__nilai">${aman(karya.durasi)}</strong>
        </div>
        <div class="kartu-meta">
          <span class="kartu-meta__label">Mata Kuliah</span>
          <strong class="kartu-meta__nilai">${aman(karya.mataKuliah)}</strong>
        </div>
      </section>

      <!-- Baris Tombol Aksi -->
      <section class="baris-aksi">
        <button class="tombol tombol--utama tombol--penuh" id="tombol-bagikan-bawah" type="button">
          Bagikan Karya
        </button>
        <a class="tombol tombol--garis tombol--penuh" id="tombol-buka-youtube" href="${youtubeUrl}" target="_blank" rel="noopener noreferrer">
          Buka di YouTube
        </a>
      </section>

      <!-- Karya Lain dari Kreator -->
      ${
        karyaLain.length > 0
          ? `
          <section class="bagian">
            <h2 class="judul-bagian">Karya Lain dari Kreator</h2>
            <div class="grid-2">
              ${karyaLain
                .map(
                  (k) => `
                <a class="kartu" href="detail.html?id=${k.id}">
                  ${thumbKarya(k, { label: false, tinggi: 100 })}
                  <span class="kartu__judul">${aman(k.judul)}</span>
                </a>`
                )
                .join('')}
            </div>
          </section>`
          : ''
      }
    </div>
  `;

  // Pasang event listener untuk tombol bagikan di baris aksi
  const tombolBagikanBawah = document.getElementById('tombol-bagikan-bawah');
  if (tombolBagikanBawah) {
    tombolBagikanBawah.addEventListener('click', () => bagikanKarya(karya));
  }

  // Interaktivitas area pemutar media saat tombol putar diklik
  const tombolPutar = document.getElementById('tombol-putar');
  const areaPemutar = document.getElementById('area-pemutar');
  if (tombolPutar && areaPemutar) {
    tombolPutar.addEventListener('click', () => {
      if (karya.youtubeId) {
        areaPemutar.innerHTML = `
          <iframe
            class="pemutar-media__iframe"
            src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(karya.youtubeId)}?autoplay=1"
            title="${aman(karya.judul)}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>`;
      } else {
        window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
      }
    });
  }
})();
