using UnityEngine;

// ============================================================
// SCRIPT: Sampah.cs
// Fungsi: Sampah yang bisa diambil player untuk mendapat skor
// Attach ke: GameObject "Sampah"
// ============================================================

public class Sampah : MonoBehaviour
{
    [Header("Pengaturan Sampah")]
    public int nilaiSkor = 10;              // Skor yang didapat saat diambil
    public GameObject efekAmbil;            // Efek partikel saat diambil
    public AudioClip suaraAmbil;            // Suara saat diambil

    [Header("Animasi Melayang")]
    public float amplitudeLayang = 0.1f;    // Seberapa tinggi sampah naik-turun
    public float kecepatanLayang = 2f;      // Seberapa cepat naik-turun

    private Vector3 posisiAwal;
    private AudioSource audioSource;
    private bool sudahDiambil = false;      // Cegah diambil 2x

    void Start()
    {
        posisiAwal = transform.position;
        audioSource = GetComponent<AudioSource>();
    }

    void Update()
    {
        // Animasi sampah melayang naik-turun
        float y = posisiAwal.y + Mathf.Sin(Time.time * kecepatanLayang) * amplitudeLayang;
        transform.position = new Vector3(posisiAwal.x, y, posisiAwal.z);

        // Animasi rotasi pelan
        transform.Rotate(0, 0, 30f * Time.deltaTime);
    }

    // Dipanggil saat player menyentuh sampah
    void OnTriggerEnter2D(Collider2D other)
    {
        // Cek apakah yang menyentuh adalah player
        if (other.CompareTag("Player") && !sudahDiambil)
        {
            sudahDiambil = true;
            AmbilSampah();
        }
    }

    void AmbilSampah()
    {
        // Tambah skor
        if (GameManager.Instance != null)
        {
            GameManager.Instance.TambahSkor(nilaiSkor, "✅ Sampah +10!");
        }

        // Spawn efek visual (partikel)
        if (efekAmbil != null)
        {
            GameObject efek = Instantiate(efekAmbil, transform.position, Quaternion.identity);
            Destroy(efek, 2f); // Hapus efek setelah 2 detik
        }

        // Mainkan suara
        if (suaraAmbil != null)
        {
            AudioSource.PlayClipAtPoint(suaraAmbil, transform.position);
        }

        // Hancurkan objek sampah ini
        Destroy(gameObject);
    }
}
