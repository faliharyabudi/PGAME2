using UnityEngine;
using UnityEngine.UI;
using TMPro;

// ============================================================
// SCRIPT: UIManager.cs
// Fungsi: Mengatur tampilan UI - Panel Menang, Kalah, dan animasi
// Attach ke: Canvas utama
// ============================================================

public class UIManager : MonoBehaviour
{
    [Header("Panel")]
    public GameObject panelMainMenu;
    public GameObject panelHUD;
    public GameObject panelMenang;
    public GameObject panelKalah;
    public GameObject panelPause;

    [Header("HUD Elements")]
    public TextMeshProUGUI txtSkor;
    public TextMeshProUGUI txtTimer;
    public Image[] ikonNyawa;           // Array gambar hati (3 hati)
    public Sprite spriteHatiPenuh;
    public Sprite spriteHatiKosong;
    public Slider sliderProgres;        // Progress bar menuju skor 250

    [Header("Panel Menang")]
    public TextMeshProUGUI txtSkorMenang;
    public TextMeshProUGUI txtBintang;  // 1-3 bintang berdasarkan waktu sisa
    public Button btnMainLagi;
    public Button btnMenu;

    [Header("Panel Kalah")]
    public TextMeshProUGUI txtAlasanKalah;
    public TextMeshProUGUI txtSkorKalah;
    public Button btnUlangKalah;
    public Button btnMenuKalah;

    [Header("Animasi")]
    public Animator animatorPanel;

    public static UIManager Instance;

    void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
    }

    void Start()
    {
        // Setup tombol
        btnMainLagi?.onClick.AddListener(UlangGame);
        btnMenu?.onClick.AddListener(KeMenu);
        btnUlangKalah?.onClick.AddListener(UlangGame);
        btnMenuKalah?.onClick.AddListener(KeMenu);

        // Setup slider
        if (sliderProgres != null)
        {
            sliderProgres.minValue = 0;
            sliderProgres.maxValue = 250; // skorTarget
            sliderProgres.value = 0;
        }

        TampilkanHUD();
    }

    // ============================================
    // UPDATE HUD SETIAP FRAME
    // ============================================

    public void UpdateHUD(int skor, int nyawa, float timer, int nyawaMaks = 3)
    {
        // Update teks skor
        if (txtSkor != null)
            txtSkor.text = "🏆 " + skor + " / 250";

        // Update progress bar
        if (sliderProgres != null)
            sliderProgres.value = skor;

        // Update timer dengan warna berubah
        if (txtTimer != null)
        {
            int detik = Mathf.CeilToInt(timer);
            txtTimer.text = "⏱ " + detik + "s";
            txtTimer.color = detik <= 10 ? new Color(1f, 0.3f, 0.3f) : Color.white;
        }

        // Update ikon hati nyawa
        for (int i = 0; i < ikonNyawa.Length; i++)
        {
            if (ikonNyawa[i] != null)
            {
                ikonNyawa[i].sprite = (i < nyawa) ? spriteHatiPenuh : spriteHatiKosong;
                // Animasi kecil saat nyawa berkurang
                if (i == nyawa && i < nyawaMaks)
                    ikonNyawa[i].transform.localScale = Vector3.one * 0.8f;
                else
                    ikonNyawa[i].transform.localScale = Vector3.one;
            }
        }
    }

    // ============================================
    // TAMPILKAN PANEL
    // ============================================

    public void TampilkanHUD()
    {
        panelHUD?.SetActive(true);
        panelMenang?.SetActive(false);
        panelKalah?.SetActive(false);
        panelPause?.SetActive(false);
    }

    public void TampilkanMenang(int skorAkhir, float waktuSisa)
    {
        panelHUD?.SetActive(false);
        panelMenang?.SetActive(true);

        if (txtSkorMenang != null)
            txtSkorMenang.text = "Skor Kamu: " + skorAkhir;

        // Hitung bintang berdasarkan waktu sisa
        if (txtBintang != null)
        {
            if (waktuSisa > 40f)
                txtBintang.text = "⭐⭐⭐ Luar Biasa!";
            else if (waktuSisa > 20f)
                txtBintang.text = "⭐⭐ Bagus!";
            else
                txtBintang.text = "⭐ Berhasil!";
        }
    }

    public void TampilkanKalah(string alasan, int skorAkhir)
    {
        panelHUD?.SetActive(false);
        panelKalah?.SetActive(true);

        if (txtAlasanKalah != null)
            txtAlasanKalah.text = alasan;

        if (txtSkorKalah != null)
            txtSkorKalah.text = "Skor: " + skorAkhir + " / 250";
    }

    // ============================================
    // TOMBOL AKSI
    // ============================================

    void UlangGame()
    {
        UnityEngine.SceneManagement.SceneManager.LoadScene(
            UnityEngine.SceneManagement.SceneManager.GetActiveScene().name);
    }

    void KeMenu()
    {
        UnityEngine.SceneManagement.SceneManager.LoadScene("MainMenu");
    }

    public void TombolPause()
    {
        bool isPause = panelPause != null && panelPause.activeSelf;
        panelPause?.SetActive(!isPause);
        Time.timeScale = isPause ? 1f : 0f; // Beku/resume game
    }
}
