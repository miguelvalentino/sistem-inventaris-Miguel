let dataTable;

document.addEventListener('DOMContentLoaded', () => {
    loadItems();
});

async function loadItems() {
    try {
        const response = await fetch('/api/items');
        const items = await response.json();

        const tableBody = document.getElementById('tableBody');
        const selectBarang = document.getElementById('selectBarang');
        
        tableBody.innerHTML = '';
        selectBarang.innerHTML = '<option selected value="">Pilih barang</option>';

        if (items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada barang</td></tr>';
        } else {
            items.forEach((item, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.name_item}</td>
                        <td>${item.type_item}</td>
                        <td>${item.brand_item}</td>
                        <td>${item.total_item}</td>
                        <td>${item.info_item}</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', row);

                const option = document.createElement('option');
                option.value = item.id_item;
                option.textContent = `${item.name_item} (Merk: ${item.brand_item}, Stok: ${item.total_item})`;
                selectBarang.appendChild(option);
            });
        }

        const tableElement = document.getElementById('datatablesSimple');
        if (tableElement) {
            if (dataTable) {
                dataTable.destroy();
            }
            dataTable = new simpleDatatables.DataTable(tableElement);
        }

    } catch (error) {
        console.error('Error loading items:', error);
        alert("Gagal memuat data barang.");
    }
}

async function simpanBarang() {
    const idItem = document.getElementById('selectBarang').value;
    const totalEntry = document.getElementById('inItem').value; 

    if (!idItem || idItem === "") {
        alert("Pilih barang terlebih dahulu");
        return;
    }
    if (!totalEntry || totalEntry <= 0) {
        alert("Masukkan jumlah barang minimal 1");
        return;
    }

    try {
        const response = await fetch('/api/items/in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_item: parseInt(idItem),
                total_entry: parseInt(totalEntry)
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Stok telah ditambahkan.");
            
            const modalElement = document.getElementById('modalMasuk');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            location.reload(); 
        } else {
            alert("Gagal: " + (result.error || "Terjadi kesalahan pada server"));
        }

    } catch (error) {
        console.error('Error:', error);
        alert("Gagal menghubungi server");
    }
}