using UnityEngine;

// ============================================================
// SCRIPT: SampahSpawner.cs
// Fungsi: Secara otomatis spawn sampah baru di posisi acak
// Attach ke: GameObject kosong bernama "SampahSpawner"
// ============================================================

public class SampahSpawner : MonoBehaviour
{
    [Header("Pengaturan Spawn")]
    public GameObject prefabSampah;         // Drag prefab Sampah ke sini
    public int jumlahMaksimalSampah = 5;    // Maksimal sampah di layar sekaligus
    public float intervalSpawn = 5f;        // Spawn sampah baru setiap 5 detik

    [Header("Area Spawn (Batas Koordinat)")]
    public float batasKiri = -7f;
    public float batasKanan = 7f;
    public float batasBawah = -3.5f;
    public float batasAtas = 3.5f;

    private float timerSpawn = 0f;
    private int jumlahSampahSekarang = 0;

    void Start()
    {
        // Spawn sampah awal saat game mulai
        for (int i = 0; i < 3; i++)
        {
            SpawnSampah();
        }
    }

    void Update()
    {
        if (GameManager.Instance == null || !GameManager.Instance.IsGameAktif()) return;

        timerSpawn += Time.deltaTime;

        if (timerSpawn >= intervalSpawn)
        {
            timerSpawn = 0f;

            // Hitung berapa sampah yang masih ada
            jumlahSampahSekarang = GameObject.FindGameObjectsWithTag("Sampah").Length;

            // Spawn jika belum mencapai batas maksimal
            if (jumlahSampahSekarang < jumlahMaksimalSampah)
            {
                SpawnSampah();
            }
        }
    }

    void SpawnSampah()
    {
        if (prefabSampah == null) return;

        // Posisi acak dalam area yang ditentukan
        float x = Random.Range(batasKiri, batasKanan);
        float y = Random.Range(batasBawah, batasAtas);
        Vector3 posisiSpawn = new Vector3(x, y, 0);

        // Instansiasi (buat) objek sampah baru
        GameObject sampahBaru = Instantiate(prefabSampah, posisiSpawn, Quaternion.identity);
        sampahBaru.tag = "Sampah"; // Pastikan tag benar
    }

    // Visualisasi area spawn di editor (kotak hijau)
    void OnDrawGizmos()
    {
        Gizmos.color = Color.green;
        Vector3 tengah = new Vector3(
            (batasKiri + batasKanan) / 2,
            (batasBawah + batasAtas) / 2,
            0
        );
        Vector3 ukuran = new Vector3(
            batasKanan - batasKiri,
            batasAtas - batasBawah,
            0
        );
        Gizmos.DrawWireCube(tengah, ukuran);
    }
}
