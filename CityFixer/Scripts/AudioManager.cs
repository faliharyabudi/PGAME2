using UnityEngine;

// ============================================================
// SCRIPT: AudioManager.cs
// Fungsi: Mengatur semua suara dalam game (musik + efek suara)
// Attach ke: GameObject kosong bernama "AudioManager"
// ============================================================

public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance;

    [Header("Musik Latar")]
    public AudioClip musikGame;
    public AudioClip musikMenang;
    public AudioClip musikKalah;

    [Header("Efek Suara")]
    public AudioClip[] suaraSampah;     // Array beberapa variasi suara sampah
    public AudioClip suaraLampu;
    public AudioClip suaraPolusi;
    public AudioClip suaraNyawaHabis;

    [Header("Volume")]
    [Range(0f, 1f)] public float volumeMusik = 0.5f;
    [Range(0f, 1f)] public float volumeEfek = 0.8f;

    private AudioSource sourceMusik;
    private AudioSource sourceEfek;

    void Awake()
    {
        // Singleton - AudioManager tidak dihapus saat ganti scene
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject); // Tetap ada antar scene
        }
        else
        {
            Destroy(gameObject);
            return;
        }

        // Buat dua AudioSource: satu untuk musik, satu untuk efek
        sourceMusik = gameObject.AddComponent<AudioSource>();
        sourceMusik.loop = true;
        sourceMusik.volume = volumeMusik;

        sourceEfek = gameObject.AddComponent<AudioSource>();
        sourceEfek.volume = volumeEfek;
    }

    void Start()
    {
        MainMusik(musikGame);
    }

    // ---- MUSIK ----

    public void MainMusik(AudioClip clip)
    {
        if (clip == null || sourceMusik == null) return;
        sourceMusik.clip = clip;
        sourceMusik.Play();
    }

    public void StopMusik()
    {
        sourceMusik?.Stop();
    }

    // ---- EFEK SUARA ----

    public void PlaySuaraSampah()
    {
        if (suaraSampah.Length == 0) return;
        // Pilih suara acak dari array
        int idx = Random.Range(0, suaraSampah.Length);
        sourceEfek?.PlayOneShot(suaraSampah[idx]);
    }

    public void PlaySuaraLampu()
    {
        sourceEfek?.PlayOneShot(suaraLampu);
    }

    public void PlaySuaraPolusi()
    {
        sourceEfek?.PlayOneShot(suaraPolusi);
    }

    public void PlayMenang()
    {
        StopMusik();
        sourceEfek?.PlayOneShot(musikMenang);
    }

    public void PlayKalah()
    {
        StopMusik();
        sourceEfek?.PlayOneShot(musikKalah);
    }

    // ---- PENGATURAN VOLUME ----

    public void SetVolumeMusik(float vol)
    {
        volumeMusik = vol;
        if (sourceMusik != null) sourceMusik.volume = vol;
    }

    public void SetVolumeEfek(float vol)
    {
        volumeEfek = vol;
        if (sourceEfek != null) sourceEfek.volume = vol;
    }
}
