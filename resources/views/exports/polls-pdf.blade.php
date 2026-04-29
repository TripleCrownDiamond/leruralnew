<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport des Sondages - {{ ucfirst($filename) }}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.6;
        }
        h1 { 
            color: #2c3e50; 
            text-align: center;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        .header-info {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .poll { 
            margin-bottom: 30px; 
            border: 1px solid #ddd; 
            padding: 20px; 
            border-radius: 8px;
            background: #f9f9f9;
        }
        .poll h3 { 
            color: #2c3e50; 
            margin-top: 0;
            font-size: 18px;
        }
        .stats { 
            font-weight: bold; 
            color: #555; 
            margin-bottom: 15px;
            padding: 10px;
            background: #ecf0f1;
            border-radius: 4px;
        }
        .options { 
            margin: 15px 0; 
        }
        .option { 
            margin: 8px 0; 
            padding: 10px; 
            background: #fff;
            border-left: 4px solid #3498db;
            border-radius: 4px;
        }
        .option-label {
            font-weight: bold;
            color: #2c3e50;
        }
        .option-votes {
            color: #e74c3c;
            font-weight: bold;
        }
        .option-percentage {
            color: #27ae60;
            font-weight: bold;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #ecf0f1;
            border-radius: 4px;
            margin-top: 5px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: #3498db;
            border-radius: 4px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @page {
            margin: 20mm;
            @bottom-center {
                content: "Page " counter(page) " sur " counter(pages);
                font-size: 10px;
                color: #7f8c8d;
            }
        }
    </style>
</head>
<body>
    <h1>Rapport des Sondages</h1>
    <div class="header-info">
        <p><strong>Type:</strong> {{ ucfirst($filename) }}</p>
        <p><strong>Généré le:</strong> {{ $generated_at }}</p>
    </div>

    @forelse ($polls as $poll)
        <div class="poll">
            <h3>{{ $poll['question'] }}</h3>
            <div class="stats">
                <span>Statut: {{ $poll['is_active'] ? '✓ Actif' : '✗ Inactif' }}</span> | 
                <span>Total des votes: {{ $poll['total_votes'] }}</span> | 
                <span>Créé le: {{ $poll['created_at'] }}</span>
            </div>
            <div class="options">
                <h4 style="margin-bottom: 10px; color: #2c3e50;">Résultats:</h4>
                @foreach ($poll['options'] as $option)
                    <div class="option">
                        <div class="option-label">{{ $option['label'] }}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="option-votes">{{ $option['votes'] }} vote(s)</span>
                            <span class="option-percentage">{{ $option['percentage'] }}%</span>
                        </div>
                        @if ($poll['total_votes'] > 0)
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: {{ $option['percentage'] }}%"></div>
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>
    @empty
        <p style="text-align: center; color: #e74c3c;">Aucun sondage trouvé.</p>
    @endforelse

    <div class="footer">
        <p>Rapport généré automatiquement par Le Rural - Système de Sondages</p>
    </div>
</body>
</html>
