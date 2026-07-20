<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Board;
use App\Models\BoardList;
use App\Models\Member;
use App\Models\Tag;
use App\Models\Card;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Default Laravel User Seeding
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // 1. Seed Members
        $sunny = Member::create(['name' => 'Sunny Kumar', 'email' => 'sunny@example.com']);
        $alice = Member::create(['name' => 'Alice Smith', 'email' => 'alice@example.com']);
        $bob = Member::create(['name' => 'Bob Johnson', 'email' => 'bob@example.com']);

        // 2. Seed Tags
        $bug = Tag::create(['name' => 'Bug', 'color' => '#f43f5e']);
        $feature = Tag::create(['name' => 'Feature', 'color' => '#3b82f6']);
        $design = Tag::create(['name' => 'Design', 'color' => '#10b981']);
        $docs = Tag::create(['name' => 'Documentation', 'color' => '#f59e0b']);

        // 3. Seed Board 1: Product Design Board
        $designBoard = Board::create([
            'name' => 'Product Design Board',
            'description' => 'Figma mockups, design systems, visual styling guidelines, and brand assets.',
        ]);

        $designBoard->members()->attach([$alice->id, $bob->id]);

        $backlogList = BoardList::create(['board_id' => $designBoard->id, 'name' => 'Backlog', 'order' => 0]);
        $inReviewList = BoardList::create(['board_id' => $designBoard->id, 'name' => 'In Review', 'order' => 1]);
        $approvedList = BoardList::create(['board_id' => $designBoard->id, 'name' => 'Approved', 'order' => 2]);

        $card1 = Card::create([
            'board_list_id' => $backlogList->id,
            'title' => 'Design Homepage Mockups',
            'description' => 'Create web and mobile homepage wireframes and layout styles in Figma.',
            'due_date' => Carbon::now()->addDays(5),
            'member_id' => $alice->id,
            'order' => 0,
        ]);
        $card1->tags()->attach($design->id);

        $card2 = Card::create([
            'board_list_id' => $inReviewList->id,
            'title' => 'Review Color Palette Contrast',
            'description' => 'Verify color choices comply with WCAG AA accessibility standards.',
            'due_date' => Carbon::now()->subDays(1), // Overdue!
            'member_id' => $bob->id,
            'order' => 0,
        ]);
        $card2->tags()->attach([$design->id, $bug->id]);

        // 4. Seed Board 2: Engineering Sprint Board
        $sprintBoard = Board::create([
            'name' => 'Engineering Sprint Board',
            'description' => 'Current core development sprint tasks, backend API integration, and React styling.',
        ]);

        $sprintBoard->members()->attach([$sunny->id, $alice->id, $bob->id]);

        $todo = BoardList::create(['board_id' => $sprintBoard->id, 'name' => 'To Do', 'order' => 0]);
        $doing = BoardList::create(['board_id' => $sprintBoard->id, 'name' => 'Doing', 'order' => 1]);
        $done = BoardList::create(['board_id' => $sprintBoard->id, 'name' => 'Done', 'order' => 2]);

        $card3 = Card::create([
            'board_list_id' => $todo->id,
            'title' => 'Implement OAuth Login',
            'description' => 'Configure social authentication via Google and GitHub with Laravel Socialite.',
            'due_date' => Carbon::now()->addDays(3),
            'member_id' => $bob->id,
            'order' => 0,
        ]);
        $card3->tags()->attach($feature->id);

        $card4 = Card::create([
            'board_list_id' => $todo->id,
            'title' => 'Fix DB Migration Deadlocks',
            'description' => 'Debug SQLITE database file locking errors when running parallel unit test suites.',
            'due_date' => Carbon::now()->subDays(2), // Overdue!
            'member_id' => $sunny->id,
            'order' => 1,
        ]);
        $card4->tags()->attach($bug->id);

        $card5 = Card::create([
            'board_list_id' => $doing->id,
            'title' => 'Build React Trello Board UI',
            'description' => 'Develop responsive board columns, card detail editing popups, tags editor, and assignee selectors.',
            'due_date' => Carbon::now()->addDays(2),
            'member_id' => $sunny->id,
            'order' => 0,
        ]);
        $card5->tags()->attach([$feature->id, $design->id]);

        $card6 = Card::create([
            'board_list_id' => $done->id,
            'title' => 'Configure SQLite Database Support',
            'description' => 'Modify php.ini on windows host to load the SQLite PDO DLLs and successfully run artisan migrations.',
            'due_date' => Carbon::now()->subDays(4),
            'member_id' => $sunny->id,
            'order' => 0,
        ]);
        $card6->tags()->attach([$feature->id, $docs->id]);
    }
}
