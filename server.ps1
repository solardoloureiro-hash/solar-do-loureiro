# Servidor HTTP com suporte completo a byte-range para vídeo MP4
# Solar do Loureiro - Link in Bio

$port = 8080
$rootPath = $PSScriptRoot

# Matar qualquer processo na porta 8080
$existing = netstat -ano | Select-String ":$port " | Select-Object -First 1
if ($existing) {
    $pid_match = ([regex]'\d+$').Match($existing.Line)
    if ($pid_match.Success) {
        try { Stop-Process -Id $pid_match.Value -Force -ErrorAction SilentlyContinue } catch {}
    }
}

Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Net;
using System.Text;
using System.Collections.Generic;

public class VideoServer {
    private HttpListener listener;
    private string root;

    public VideoServer(string rootPath, int port) {
        this.root = rootPath;
        this.listener = new HttpListener();
        this.listener.Prefixes.Add("http://localhost:" + port + "/");
    }

    public void Start() {
        listener.Start();
        Console.WriteLine("==============================================");
        Console.WriteLine(" Solar do Loureiro - Servidor activo!");
        Console.WriteLine(" Abre o browser em: http://localhost:8080/");
        Console.WriteLine("==============================================");
        while (listener.IsListening) {
            try { HandleRequest(listener.GetContext()); }
            catch (Exception) { }
        }
    }

    private string GetMime(string ext) {
        switch (ext.ToLower()) {
            case ".html": return "text/html; charset=utf-8";
            case ".css":  return "text/css; charset=utf-8";
            case ".js":   return "application/javascript";
            case ".mp4":  return "video/mp4";
            case ".webm": return "video/webm";
            case ".png":  return "image/png";
            case ".jpg":
            case ".jpeg": return "image/jpeg";
            default:      return "application/octet-stream";
        }
    }

    private void HandleRequest(HttpListenerContext ctx) {
        var req = ctx.Request;
        var res = ctx.Response;
        try {
            string path = req.Url.LocalPath;
            if (path == "/" || path == "") path = "/index.html";
            string filePath = Path.Combine(root, path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

            if (!File.Exists(filePath)) {
                res.StatusCode = 404;
                byte[] nb = Encoding.UTF8.GetBytes("404 Not Found");
                res.ContentLength64 = nb.Length;
                res.OutputStream.Write(nb, 0, nb.Length);
                res.OutputStream.Close();
                return;
            }

            string ext  = Path.GetExtension(filePath);
            long fileLen = new FileInfo(filePath).Length;

            res.AddHeader("Access-Control-Allow-Origin", "*");
            res.AddHeader("Accept-Ranges", "bytes");
            res.AddHeader("Cache-Control", "no-cache");
            res.ContentType = GetMime(ext);

            string rangeHdr = req.Headers["Range"];
            long start = 0, end = fileLen - 1;
            bool isRange = false;

            if (!string.IsNullOrEmpty(rangeHdr) && rangeHdr.StartsWith("bytes=")) {
                isRange = true;
                string[] parts = rangeHdr.Substring(6).Split('-');
                if (parts[0] != "") start = long.Parse(parts[0]);
                if (parts.Length > 1 && parts[1] != "") end = long.Parse(parts[1]);
                if (end >= fileLen) end = fileLen - 1;
            }

            long length = end - start + 1;

            if (isRange) {
                res.StatusCode = 206;
                res.AddHeader("Content-Range", "bytes " + start + "-" + end + "/" + fileLen);
            } else {
                res.StatusCode = 200;
            }
            res.ContentLength64 = length;

            if (req.HttpMethod != "HEAD") {
                using (FileStream fs = File.OpenRead(filePath)) {
                    fs.Seek(start, SeekOrigin.Begin);
                    byte[] buf = new byte[65536];
                    long rem = length;
                    while (rem > 0) {
                        int toRead = (int)Math.Min(buf.Length, rem);
                        int read = fs.Read(buf, 0, toRead);
                        if (read <= 0) break;
                        res.OutputStream.Write(buf, 0, read);
                        rem -= read;
                    }
                }
            }
        } catch (Exception ex) {
            Console.WriteLine("Error: " + ex.Message);
        } finally {
            try { res.OutputStream.Close(); } catch {}
        }
    }
}
"@ -ReferencedAssemblies System.Net, System.IO

$server = New-Object VideoServer($rootPath, $port)
$server.Start()
