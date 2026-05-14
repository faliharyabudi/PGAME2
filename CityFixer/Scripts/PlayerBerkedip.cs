using UnityEngine;
using System.Collections;

// ============================================================
// SCRIPT: PlayerBerkedip.cs
// Fungsi: Efek berkedip saat player kena polusi (invincibility frames)
// Attach ke: Player (sama dengan PlayerMovement)
// ============================================================

public class PlayerBerkedip : MonoBehaviour
{
    [Header("Pengaturan Kedip")]
    public float durasiKedip = 2f;      // Berapa lama player berkedip
    public float intervalKedip = 0.15f; // Seberapa cepat kedipnya

    private SpriteRenderer spriteRenderer;
    private bool sedangInvincible = false;

    void Start()
    {
        spriteRenderer = GetComponent<SpriteRenderer>();
    }

    // Dipanggil dari PolusiKendaraan saat player kena
    public void MulaiKedip()
    {
        if (!sedangInvincible)
            StartCoroutine(EfekKedip());
    }

    IEnumerator EfekKedip()
    {
        sedangInvincible = true;
        float elapsed = 0f;

        while (elapsed < durasiKedip)
        {
            // Toggle visibility sprite
            if (spriteRenderer != null)
                spriteRenderer.enabled = !spriteRenderer.enabled;

            yield return new WaitForSeconds(intervalKedip);
            elapsed += intervalKedip;
        }

        // Pastikan sprite terlihat di akhir
        if (spriteRenderer != null)
            spriteRenderer.enabled = true;

        sedangInvincible = false;
    }

    public bool IsInvincible() => sedangInvincible;
}
