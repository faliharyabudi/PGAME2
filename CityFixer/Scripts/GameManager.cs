using UnityEngine;
using UnityEngine.UI;
using TMPro;

// ============================================================
// SCRIPT: GameManager.cs  (VERSI FINAL - Terintegrasi UIManager)
// Fungsi: Pusat kontrol game — skor, nyawa, timer, menang/kalah
// Attach ke: GameObject kosong bernama "GameManager"
// ============================================================

public class GameManager : MonoBehaviour
{
    // ---- SINGLETON PATTERN ----
    // Agar script lain bisa akses GameManager dari mana saja
    // Contoh: GameManager.Instance.TambahSkor(10);
    public static GameManager Instance;

    // ============================================================
    // PENGATURAN GAME (Bisa diubah di Inspector Unity)
    // ============================================================

    [Header("=== PENGATURAN UTAMA ===")]
    public int  skorTarget       = 250;   // Skor untuk menang
    public float waktuPermainan  = 60f;   // Durasi permainan (detik)
    public int  jumlahNyawa      = 3;     // Nyawa awal player

    [Header("=== NILAI OBJEK ===")]
    public int  nilaiSampah      = 10;    // Skor saat ambil sampah
    public int  nilaiLampu       = 30;    // Skor saat perbaiki lampu
    public int  penaltiPolusi    = -20;   // Penalti skor kena polusi (NEGATIF)
    public int  nyawaHilang      = 1;     // Nyawa berkurang per tabrakan

    [Header("=== UI — Drag dari Hierarchy ===")]
    public TextMeshProUGUI textSkor;      // Teks skor di HUD
    public TextMeshProUGUI textTimer;     // Teks timer di HUD
    public TextMeshProUGUI textPesan;     // Pesan flash "Sampah +10!" dll.
    public GameObject      panelHUD;      // Panel saat bermain
    public GameObject      panelMenang;   // Panel saat menang
    public GameObject      panelKalah;    // Panel saat kalah

    [Header("=== SUARA ===")]
    public AudioClip suaraSampah;
    public AudioClip suaraLampu;
    public AudioClip suaraPolusi;
    public AudioClip suaraMenang;
    public AudioClip suaraKalah;

    // ============================================================
    // VARIABEL INTERNAL (jangan diubah di Inspector)
    // ============================================================

    private int   skorSekarang   = 0;
    private int   nyawaSekarang;
    private float timerSekarang;
    private bool  gameAktif      = false;

    private AudioSource audioSource;

    // ============================================================
    // UNITY LIFECYCLE
    // ============================================================

    void Awake()
    {
        // Setup Singleton
        if (Instance == null)
            Instance = this;
        else
        {
            Destroy(gameObject);
            return;
        }
    }

    void Start()
    {
        audioSource    = GetComponent<AudioSource>();
        nyawaSekarang  = jumlahNyawa;
        timerSekarang  = waktuPermainan;
        skorSekarang   = 0;

        MulaiGame();
    }

    void Update()
    {
        if (!gameAktif) return;

        // Hitung mundur timer setiap frame
        timerSekarang -= Time.deltaTime;

        // Refresh tampilan UI
        RefreshUI();

        // Cek waktu habis
        if (timerSekarang <= 0f)
        {
            timerSekarang = 0f;
            GameOver("⏱ Waktu Habis!");
        }
    }

    // ============================================================
    // FUNGSI UTAMA — dipanggil oleh script lain
    // ============================================================

    /// <summary>Mulai / restart sesi permainan</summary>
    public void MulaiGame()
    {
        gameAktif = true;

        panelHUD?.SetActive(true);
        panelMenang?.SetActive(false);
        panelKalah?.SetActive(false);

        RefreshUI();
        Debug.Log("[GameManager] Game dimulai!");
    }

    /// <summary>Tambah atau kurangi skor. Nilai bisa negatif.</summary>
    /// <param name="nilai">Angka yang ditambahkan ke skor</param>
    /// <param name="pesan">Teks flash singkat di layar</param>
    public void TambahSkor(int nilai, string pesan = "")
    {
        if (!gameAktif) return;

        skorSekarang += nilai;
        skorSekarang  = Mathf.Max(0, skorSekarang); // Skor tidak bisa di bawah 0

        Debug.Log($"[GameManager] Skor berubah: {skorSekarang} (nilai: {nilai})");

        // Tampilkan pesan flash jika ada
        if (!string.IsNullOrEmpty(pesan))
            TampilkanPesanFlash(pesan);

        // Cek kondisi menang
        if (skorSekarang >= skorTarget)
            Menang();

        // Sinkronisasi ke UIManager jika ada
        UIManager.Instance?.UpdateHUD(skorSekarang, nyawaSekarang, timerSekarang, jumlahNyawa);
    }

    /// <summary>Kurangi nyawa player. Dipanggil oleh PolusiKendaraan.cs</summary>
    public void KurangiNyawa()
    {
        if (!gameAktif) return;

        nyawaSekarang -= nyawaHilang;
        nyawaSekarang  = Mathf.Max(0, nyawaSekarang);

        Debug.Log($"[GameManager] Nyawa tersisa: {nyawaSekarang}");

        // Efek getaran kamera
        Camera.main?.GetComponent<CameraShake>()?.MulaiShake(0.3f, 0.15f);

        // Efek suara
        PlaySuara(suaraPolusi);

        // Cek game over
        if (nyawaSekarang <= 0)
            GameOver("💀 Kehabisan Nyawa!");

        // Sinkronisasi ke UIManager
        UIManager.Instance?.UpdateHUD(skorSekarang, nyawaSekarang, timerSekarang, jumlahNyawa);
    }

    // ============================================================
    // KONDISI AKHIR GAME
    // ============================================================

    void Menang()
    {
        gameAktif = false;

        panelHUD?.SetActive(false);
        panelMenang?.SetActive(true);

        PlaySuara(suaraMenang);

        // Kirim data ke UIManager untuk tampilkan skor + bintang
        UIManager.Instance?.TampilkanMenang(skorSekarang, timerSekarang);

        Debug.Log($"[GameManager] MENANG! Skor: {skorSekarang}");
    }

    void GameOver(string alasan)
    {
        gameAktif = false;

        panelHUD?.SetActive(false);
        panelKalah?.SetActive(true);

        PlaySuara(suaraKalah);

        // Kirim data ke UIManager untuk tampilkan alasan kalah
        UIManager.Instance?.TampilkanKalah(alasan, skorSekarang);

        Debug.Log($"[GameManager] GAME OVER: {alasan}");
    }

    // ============================================================
    // UPDATE UI MANUAL (fallback tanpa UIManager)
    // ============================================================

    void RefreshUI()
    {
        // Jika UIManager ada, delegasikan ke sana
        if (UIManager.Instance != null)
        {
            UIManager.Instance.UpdateHUD(skorSekarang, nyawaSekarang, timerSekarang, jumlahNyawa);
            return;
        }

        // Fallback: update langsung jika tidak ada UIManager
        if (textSkor != null)
            textSkor.text = $"Skor: {skorSekarang} / {skorTarget}";

        if (textTimer != null)
        {
            int detik = Mathf.CeilToInt(timerSekarang);
            textTimer.text  = $"Waktu: {detik}s";
            textTimer.color = detik <= 10 ? Color.red : Color.white;
        }
    }

    // ============================================================
    // PESAN FLASH (teks muncul sebentar lalu hilang)
    // ============================================================

    void TampilkanPesanFlash(string pesan)
    {
        if (textPesan == null) return;
        StopCoroutine("AnimasiPesan");
        StartCoroutine(AnimasiPesan(pesan));
    }

    System.Collections.IEnumerator AnimasiPesan(string pesan)
    {
        textPesan.text = pesan;
        textPesan.gameObject.SetActive(true);

        // Animasi fade in → tunggu → fade out
        float durasi = 1.5f;
        float elapsed = 0f;

        while (elapsed < durasi)
        {
            elapsed += Time.deltaTime;
            yield return null;
        }

        textPesan.gameObject.SetActive(false);
    }

    // ============================================================
    // HELPER
    // ============================================================

    void PlaySuara(AudioClip clip)
    {
        if (audioSource != null && clip != null)
            audioSource.PlayOneShot(clip);
    }

    // ---- TOMBOL UI (hubungkan via Button.OnClick di Inspector) ----

    public void TombolUlang()
    {
        Time.timeScale = 1f; // Reset jika sebelumnya di-pause
        UnityEngine.SceneManagement.SceneManager.LoadScene(
            UnityEngine.SceneManagement.SceneManager.GetActiveScene().name);
    }

    public void TombolMenu()
    {
        Time.timeScale = 1f;
        UnityEngine.SceneManagement.SceneManager.LoadScene("MainMenu");
    }

    // ---- GETTER: dipakai script lain ----
    public bool  IsGameAktif() => gameAktif;
    public int   GetSkor()     => skorSekarang;
    public int   GetNyawa()    => nyawaSekarang;
    public float GetTimer()    => timerSekarang;
}
