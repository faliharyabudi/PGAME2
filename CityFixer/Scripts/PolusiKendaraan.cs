using UnityEngine;

// ============================================================
// SCRIPT: PolusiKendaraan.cs
// Fungsi: Kendaraan berpolusi yang bergerak dan melukai player
// Attach ke: GameObject "PolusiKendaraan"
// ============================================================

public class PolusiKendaraan : MonoBehaviour
{
    [Header("Pengaturan Gerak")]
    public float kecepatanMin = 2f;         // Kecepatan minimum kendaraan
    public float kecepatanMaks = 5f;        // Kecepatan maksimum kendaraan
    public bool gerakHorizontal = true;     // True = gerak kiri-kanan, False = atas-bawah

    [Header("Batas Layar")]
    public float batasLayar = 10f;          // Seberapa jauh sebelum di-reset posisi

    [Header("Visual")]
    public TrailRenderer jejakPolusi;       // Jejak asap di belakang kendaraan
    public ParticleSystem efekPolusi;       // Efek asap/polusi

    [Header("Cooldown Kerusakan")]
    public float waktuCooldown = 2f;        // Player tidak bisa kena 2x dalam 2 detik

    private float kecepatan;
    private Vector2 arahGerak;
    private float timerCooldown = 0f;
    private bool sedangCooldown = false;

    void Start()
    {
        // Pilih kecepatan acak
        kecepatan = Random.Range(kecepatanMin, kecepatanMaks);

        // Tentukan arah gerak
        if (gerakHorizontal)
        {
            // Muncul dari kiri atau kanan secara acak
            int arah = Random.value > 0.5f ? 1 : -1;
            arahGerak = new Vector2(arah, 0);

            // Flip sprite jika bergerak ke kanan
            if (arah > 0)
                transform.localScale = new Vector3(-Mathf.Abs(transform.localScale.x),
                    transform.localScale.y, transform.localScale.z);
        }
        else
        {
            int arah = Random.value > 0.5f ? 1 : -1;
            arahGerak = new Vector2(0, arah);
        }

        // Mainkan efek asap
        if (efekPolusi != null)
            efekPolusi.Play();
    }

    void Update()
    {
        // Gerakkan kendaraan
        transform.Translate(arahGerak * kecepatan * Time.deltaTime);

        // Reset posisi jika keluar layar (looping)
        ResetJikaKeluarLayar();

        // Hitung cooldown
        if (sedangCooldown)
        {
            timerCooldown -= Time.deltaTime;
            if (timerCooldown <= 0)
                sedangCooldown = false;
        }
    }

    void ResetJikaKeluarLayar()
    {
        Vector3 pos = transform.position;

        if (gerakHorizontal)
        {
            if (pos.x > batasLayar)
                pos.x = -batasLayar;
            else if (pos.x < -batasLayar)
                pos.x = batasLayar;
        }
        else
        {
            if (pos.y > batasLayar)
                pos.y = -batasLayar;
            else if (pos.y < -batasLayar)
                pos.y = batasLayar;
        }

        transform.position = pos;
    }

    // Dipanggil saat menyentuh player
    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player") && !sedangCooldown)
        {
            // Kurangi nyawa player
            if (GameManager.Instance != null && GameManager.Instance.IsGameAktif())
            {
                GameManager.Instance.KurangiNyawa();
                GameManager.Instance.TambahSkor(GameManager.Instance.penaltiPolusi);
            }

            // Aktifkan cooldown agar tidak langsung kena lagi
            sedangCooldown = true;
            timerCooldown = waktuCooldown;

            // Efek visual saat menabrak (buat player berkedip)
            PlayerBerkedip playerScript = other.GetComponent<PlayerBerkedip>();
            playerScript?.MulaiKedip();
        }
    }
}
