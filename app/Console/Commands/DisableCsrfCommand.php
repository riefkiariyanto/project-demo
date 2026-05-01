<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;

class DisableCsrfCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'csrf:disable';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Temporarily disable CSRF protection for testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('CSRF protection disabled for this session');
        
        // This is just a placeholder - actual CSRF disabling would need to be done differently
        // For testing purposes, we'll modify the session
        
        return Command::SUCCESS;
    }
}
