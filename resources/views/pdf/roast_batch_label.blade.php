<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Label: {{ $roastBatch->greenBean->nama_kopi ?? 'N/A' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 8pt; /* Ukuran font dasar */
            line-height: 1.3; /* Jarak antar baris diperketat */
        }
        .label-container {
            width: 100%;
            height: 100%;
            border: 1px solid #000;
            padding: 0.2cm; /* Padding di sekeliling konten */
        }
        .coffee-name {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 0.15cm;
            text-transform: uppercase;
            text-align: center;
        }
        .details-wrapper::after {
            content: "";
            clear: both;
            display: table;
        }
        .left-col {
            float: left;
            width: 48%;
        }
        .right-col {
            float: right;
            width: 48%;
        }
        p {
            margin-bottom: 1px;
        }
        strong {
            font-weight: bold;
        }
        .tasting-notes {
            margin-top: 0.2cm;
            clear: both; /* Pastikan ini di bawah kolom float */
        }
        .roast-date {
            margin-top: 0.2cm;
            font-size: 10pt;
            font-weight: bold;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="label-container">
        @if($roastBatch->greenBean)
            <div class="coffee-name">{{ $roastBatch->greenBean->nama_kopi }}</div>

            <div class="details-wrapper">
                <div class="left-col">
                    <p><strong>Origin:</strong> {{ $roastBatch->greenBean->origin ?? 'N/A' }}</p>
                    <p><strong>Altitude:</strong> {{ $roastBatch->greenBean->altitude ?? 'N/A' }}</p>
                    <p><strong>Varietal:</strong> {{ $roastBatch->greenBean->varietas ?? 'N/A' }}</p>
                </div>
                <div class="right-col">
                    <p><strong>Process:</strong> {{ $roastBatch->greenBean->processing_method ?? 'N/A' }}</p>
                    <p><strong>Processor:</strong> {{ $roastBatch->greenBean->processor ?? 'N/A' }}</p>
                </div>
            </div>

            <div class="tasting-notes">
                <strong>Tasting Notes:</strong>
                {{ $roastBatch->greenBean->tasting_notes ?? 'N/A' }}
            </div>

            <div class="roast-date">
                ROAST DATE: {{ (new \DateTime($roastBatch->tanggal_roasting))->format('d M Y') }}
            </div>
        @else
            <p>Data Green Bean tidak ditemukan.</p>
        @endif
    </div>
</body>
</html>