using UnityEngine;
using System.Collections;

// ============================================================
// SCRIPT: CameraShake.cs
// Fungsi: Efek kamera bergetar saat player kena polusi
// Attach ke: Main Camera
// ============================================================

public class CameraShake : MonoBehaviour
{
    private Vector3 posisiAwal;

    void Start()
    {
        posisiAwal = transform.localPosition;
    }

    // Dipanggil dari GameManager saat player kena damage
    public void MulaiShake(float durasi, float besarGetar)
    {
        StartCoroutine(Shake(durasi, besarGetar));
    }

    IEnumerator Shake(float durasi, float besarGetar)
    {
        float elapsed = 0f;

        while (elapsed < durasi)
        {
            float x = posisiAwal.x + Random.Range(-besarGetar, besarGetar);
            float y = posisiAwal.y + Random.Range(-besarGetar, besarGetar);
            transform.localPosition = new Vector3(x, y, posisiAwal.z);

            elapsed += Time.deltaTime;
            yield return null;
        }

        // Kembalikan kamera ke posisi asal
        transform.localPosition = posisiAwal;
    }
}
