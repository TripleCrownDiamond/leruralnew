<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

/**
 * Middleware pour gérer les proxies de confiance (Nginx, Cloudflare, Load Balancer, etc.)
 * 
 * Important pour :
 * - Détection correcte du protocole HTTPS
 * - Obtention de la vraie adresse IP du client
 * - Bon fonctionnement des cookies de session sécurisés
 */
class TrustProxies extends Middleware
{
    /**
     * Les proxies de confiance pour cette application.
     *
     * En production derrière un reverse proxy (Nginx, Apache, Cloudflare, etc.),
     * utilisez '*' pour faire confiance à tous les proxies ou spécifiez les IPs.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = '*';

    /**
     * Les headers qui doivent être utilisés pour détecter les proxies.
     *
     * @var int
     */
    protected $headers =
        Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB;
}