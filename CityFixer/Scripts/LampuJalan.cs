using UnityEngine;

// ============================================================
// SCRIPT: LampuJalan.cs
// Fungsi: Lampu jalan rusak yang bisa diperbaiki player
// Attach ke: GameObject "LampuJalan"
// ============================================================

public class LampuJalan : MonoBehaviour
{
    [Header("Pengaturan Lampu")]
    public int nilaiSkor = 30;              // Skor untuk memperbaiki lampu
    public bool sudahRusak = true;          // Default: lampu dalam kondisi rusak

    [Header("Visual Lampu")]
    public SpriteRenderer spriteRenderer;
    public Sprite spriteRusak;              // Gambar lampu mati/rusak
    public Sprite spriteBaik;              // Gambar lampu menyala
    public GameObject cahayaLampu;          // Light2D atau efek cahaya
    public ParticleSystem efekPerbaikan;   // Efek bintang saat diperbaiki

    [Header("Interaksi")]
    public float jarakInteraksi = 1.5f;    // Jarak maksimal untuk memperbaiki
    public KeyCode tombolInteraksi = KeyCode.E; // Tekan E untuk perbaiki

    [Header("Indikator")]
    public GameObject indikatorTekan;      // Tampilkan "Tekan E" saat dekat

    private Transform player;
    private bool playerDekat = false;

    void Start()
    {
        player = GameObject.FindGameObjectWithTag("Player")?.transform;
        UpdateTampilan();

        // Sembunyikan indikator
        if (indikatorTekan != null)
            indikatorTekan.SetActive(false);
    }

    void Update()
    {
        if (!sudahRusak) return;          // Kalau sudah diperbaiki, tidak perlu cek
        if (player == null) return;
        if (!GameManager.Instance.IsGameAktif()) return;

        // Hitung jarak player ke lampu
        float jarak = Vector2.Distance(transform.position, player.position);
        playerDekat = jarak <= jarakInteraksi;

        // Tampilkan/sembunyikan indikator "Tekan E"
        if (indikatorTekan != null)
            indikatorTekan.SetActive(playerDekat);

        // Cek input tombol E saat player dekat
        if (playerDekat && Input.GetKeyDown(tombolInteraksi))
        {
            PerbaikiLampu();
        }
    }

    void PerbaikiLampu()
    {
        sudahRusak = false;

        // Update tampilan jadi lampu menyala
        UpdateTampilan();

        // Tambah skor
        if (GameManager.Instance != null)
        {
            GameManager.Instance.TambahSkor(nilaiSkor, "💡 Lampu Diperbaiki! +30");
        }

        // Mainkan efek partikel
        if (efekPerbaikan != null)
            efekPerbaikan.Play();

        // Sembunyikan indikator
        if (indikatorTekan != null)
            indikatorTekan.SetActive(false);
    }

    void UpdateTampilan()
    {
        if (spriteRenderer != null)
        {
            spriteRenderer.sprite = sudahRusak ? spriteRusak : spriteBaik;
        }

        // Nyalakan/matikan cahaya
        if (cahayaLampu != null)
        {
            cahayaLampu.SetActive(!sudahRusak);
        }
    }

    // Visualisasi jarak interaksi di Editor (warna kuning)
    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, jarakInteraksi);
    }
}
