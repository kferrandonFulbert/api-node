<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $file = $_FILES['image'];
    $filename = basename($file['name']);

    $url = 'http://localhost:3000/api/v1/uploads/' . $filename;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'image' => new CURLFile($file['tmp_name'], $file['type'], $filename)
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    echo $response ? "Image uploaded successfully" : "Image upload failed";
} else {
    echo "No image uploaded";
}
?>
<form id="uploadForm">
    <input type="file" id="imageInput" name="image" required>
    <button type="submit">Upload</button>
</form>
<hr>
<h2>Test PHP cURL POST</h2>
<form method="POST" enctype="multipart/form-data">
    <input type="file" name="image" required>
    <button type="submit">Upload via PHP</button>
</form>
<script>
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const file = document.getElementById('imageInput').files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    fetch('http://localhost:3000/api/v1/uploads/' + file.name, {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
});
</script>