using UnityEngine;

// ============================================================
// SCRIPT: PlayerMovement.cs
// Fungsi: Menggerakkan karakter player menggunakan tombol WASD
// ============================================================

public class PlayerMovement : MonoBehaviour
{
    [Header("Pengaturan Gerakan")]
    public float kecepatan = 5f;           // Kecepatan gerak player
    public float batasKiriKanan = 8f;      // Batas kiri-kanan layar
    public float batasAtasBawah = 4.5f;   // Batas atas-bawah layar

    private Rigidbody2D rb;
    private Animator anim;
    private SpriteRenderer spriteRenderer;

    void Start()
    {
        // Ambil komponen yang dibutuhkan
        rb = GetComponent<Rigidbody2D>();
        anim = GetComponent<Animator>();
        spriteRenderer = GetComponent<SpriteRenderer>();

        // Pastikan player tidak jatuh karena gravitasi
        if (rb != null)
            rb.gravityScale = 0f;
    }

    void Update()
    {
        GerakPlayer();
        BatasiPosisi();
    }

    void GerakPlayer()
    {
        // Ambil input dari keyboard (WASD atau Arrow Keys)
        float inputX = Input.GetAxisRaw("Horizontal"); // A/D atau Left/Right
        float inputY = Input.GetAxisRaw("Vertical");   // W/S atau Up/Down

        // Hitung arah gerakan
        Vector2 arahGerak = new Vector2(inputX, inputY).normalized;

        // Gerakkan player
        if (rb != null)
        {
            rb.linearVelocity = arahGerak * kecepatan;
        }
        else
        {
            // Fallback jika tidak ada Rigidbody2D
            transform.Translate(arahGerak * kecepatan * Time.deltaTime);
        }

        // Animasi berjalan
        if (anim != null)
        {
            anim.SetBool("IsMoving", arahGerak.magnitude > 0);
        }

        // Balik sprite saat bergerak ke kiri
        if (spriteRenderer != null)
        {
            if (inputX < 0) spriteRenderer.flipX = true;
            if (inputX > 0) spriteRenderer.flipX = false;
        }
    }

    void BatasiPosisi()
    {
        // Jaga agar player tidak keluar dari layar
        Vector3 pos = transform.position;
        pos.x = Mathf.Clamp(pos.x, -batasKiriKanan, batasKiriKanan);
        pos.y = Mathf.Clamp(pos.y, -batasAtasBawah, batasAtasBawah);
        transform.position = pos;
    }
}
