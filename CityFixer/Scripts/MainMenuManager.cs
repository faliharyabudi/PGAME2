using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;

// ============================================================
// SCRIPT: MainMenuManager.cs
// Fungsi: Mengatur tampilan Main Menu
// Attach ke: Canvas di scene "MainMenu"
// ============================================================

public class MainMenuManager : MonoBehaviour
{
    [Header("UI Elements")]
    public TextMeshProUGUI txtJudul;
    public TextMeshProUGUI txtSDG;
    public GameObject panelPetunjuk;    // Panel cara bermain
    public GameObject panelKredit;

    void Start()
    {
        // Pastikan musik berjalan normal
        Time.timeScale = 1f;

        // Sembunyikan panel awal
        panelPetunjuk?.SetActive(false);
        panelKredit?.SetActive(false);
    }

    // ---- TOMBOL MENU ----

    public void TombolMainGame()
    {
        // Load scene game utama
        SceneManager.LoadScene("GameScene");
    }

    public void TombolPetunjuk()
    {
        bool aktif = panelPetunjuk != null && panelPetunjuk.activeSelf;
        panelPetunjuk?.SetActive(!aktif);
    }

    public void TombolKredit()
    {
        bool aktif = panelKredit != null && panelKredit.activeSelf;
        panelKredit?.SetActive(!aktif);
    }

    public void TombolKeluar()
    {
        // Tutup aplikasi
        Application.Quit();

        // Di Editor, hentikan Play Mode
        #if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
        #endif
    }
}
