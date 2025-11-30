document.addEventListener('DOMContentLoaded', loadData);

let dataTableInstance = null;

async function loadData() {
    try {
        const res = await fetch('/api/items');
        const data = await res.json();
        let rows = '';

        data.forEach((item, index) => {
            rows += `
                <tr>
                    <td>${index + 1}</td> <td>${item.name_item}</td>
                    <td>${item.type_item || '-'}</td>
                    <td>${item.brand_item || '-'}</td>
                    <td><strong>${item.total_item}</strong></td> <td>${item.info_item || '-'}</td> <td>
                        <button class="btn btn-sm btn-warning" 
                            onclick="bukaEdit(${item.id_item}, '${item.name_item}', '${item.type_item}', '${item.brand_item}', '${item.info_item}')">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="hapus(${item.id_item})">Hapus</button>
                    </td>
                </tr>
            `;
        });

        const tabelBody = document.getElementById('tabelBarang');
        tabelBody.innerHTML = rows;

        const tabelElement = document.getElementById('datatablesSimple');
        
        if (dataTableInstance) {
            dataTableInstance.destroy();
        }
        
        if (tabelElement) {
            dataTableInstance = new simpleDatatables.DataTable(tabelElement);
        }

    } catch (error) {
        console.error('Gagal memuat data:', error);
    }
}

async function simpanBarang() {
    const payload = {
        name_item: document.getElementById('inName').value,
        type_item: document.getElementById('inType').value,
        brand_item: document.getElementById('inBrand').value,
        info_item: document.getElementById('inInfo').value
    };
    
    if(!payload.name_item) return alert("Nama barang wajib diisi!");

    await fetch('/api/items', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    
    alert('Barang tersimpan!');
    location.reload();
}

function bukaEdit(id, name, type, brand, info) {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editType').value = type !== 'null' ? type : '';
    document.getElementById('editBrand').value = brand !== 'null' ? brand : '';
    document.getElementById('editInfo').value = info !== 'null' ? info : '';
    
    new bootstrap.Modal(document.getElementById('modalEdit')).show();
}

async function updateBarang() {
    const id = document.getElementById('editId').value;
    const payload = {
        name_item: document.getElementById('editName').value,
        type_item: document.getElementById('editType').value,
        brand_item: document.getElementById('editBrand').value,
        info_item: document.getElementById('editInfo').value
    };

    await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    alert('Update berhasil');
    location.reload();
}

async function hapus(id) {
    if(!confirm('Hapus?')) return;

    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    const hasil = await res.json();

    if (hasil.error) {
        alert(hasil.error);
    } else {
        alert('Deleted');
        loadData();
    }
}