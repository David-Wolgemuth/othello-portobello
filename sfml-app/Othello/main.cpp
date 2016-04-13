// Othello Main

#include <SFML/Graphics.hpp>
#include <iostream>
#include <vector>
#include "ResourcePath.hpp"
#include "math.h"

float SCALE  = 1.0;

sf::Vector2f WINDOW_DIMENSTIONS(848 * SCALE, 848 * SCALE);
sf::Vector2f BOARD_OFFSET(24 * SCALE, 24 * SCALE);
sf::Vector2f BOARD_DIMENSIONS(800 * SCALE, 800 * SCALE);
float GRIDLINE_THICKNESS = 8 * SCALE;
float TILES = 8;

class Tile : public sf::CircleShape
{
    int player;
    sf::Vector2f coords;
public:
    Tile(float x, float y)
    {
        coords.x = x;
        coords.y = y;
        
        float space = BOARD_DIMENSIONS.x / TILES;
        float radius = (space - GRIDLINE_THICKNESS) / 2;
        setRadius(radius);
        setPosition(x * space + GRIDLINE_THICKNESS, y * space + GRIDLINE_THICKNESS);
        
        player = 0;
        setFillColor(sf::Color::Transparent);
    }
    void set_player(int p)
    {
        player = p;
        if (p == 1) {
            setFillColor(sf::Color::White);
        } else if (p == 2) {
            setFillColor(sf::Color::Black);
        }
    }
    void set_hint_color(int player)
    {
        switch (player) {
            case 0:
                setFillColor(sf::Color::Transparent);
                break;
            case 1:
                setFillColor(sf::Color(255, 255, 255, 100));    // Transparent White
                break;
            case 2:
                setFillColor(sf::Color(0, 0, 0, 100));          // Transparent Black
                break;
            default:
                break;
        }
    }
    int get_player()
    {
        return player;
    }
    sf::Vector2f get_coords()
    {
        return coords;
    }
};

class GameBoard
{
    sf::RenderWindow * window;
    sf::Vector2f dimensions;
    sf::RectangleShape board_rect;
    std::vector<sf::RectangleShape*> display_grid;
    std::vector<std::vector<Tile*>> tiles;
    std::vector<sf::Vector2f> hints;
    std::vector<std::vector<bool>> valid_moves;
    int player;
    void set_display_grid()
    {
        for (float col = 0; col < TILES+1; col++) {
            float width = GRIDLINE_THICKNESS;
            sf::RectangleShape * column = new sf::RectangleShape;
            sf::RectangleShape * row = new sf::RectangleShape;
            
            column->setSize(sf::Vector2f(width, dimensions.y));
            row->setSize(sf::Vector2f(dimensions.x, width));
            
            float x = dimensions.x * (col / TILES);
            float y = dimensions.y * (col / TILES);
            
            column->setPosition(x, 0);
            row->setPosition(0, y);
            
            column->setFillColor(sf::Color::Black);
            row->setFillColor(sf::Color::Black);
            
            display_grid.push_back(column);
            display_grid.push_back(row);
            
        }
    }
    void draw_grid()
    {
        for (int i = 0; i < display_grid.size(); i++) {
            window->draw(*display_grid[i]);
        }
    }
    void draw_tiles()
    {
        for (int i = 0; i < tiles.size(); i++) {
            for (int j = 0; j < tiles[i].size(); j++) {
                window->draw(*tiles[i][j]);
            }
        }
    }
    void set_tiles()
    {
        for (float row = 0; row < TILES; row++) {
            std::vector<Tile*> cols;
            for (float col = 0; col < TILES; col ++) {
                Tile * tile = new Tile(col, row);
                cols.push_back(tile);
            }
            tiles.push_back(cols);
        }
        tiles[3][4]->set_player(1);
        tiles[4][3]->set_player(1);
        tiles[3][3]->set_player(2);
        tiles[4][4]->set_player(2);
    }
public:
    GameBoard(sf::RenderWindow * window)
    {
        this->window = window;
        dimensions = BOARD_DIMENSIONS;
        board_rect.setSize(dimensions);
        board_rect.setFillColor(sf::Color(51, 153, 102));
        board_rect.setOutlineColor(sf::Color(153, 102, 51));
        board_rect.setOutlineThickness(GRIDLINE_THICKNESS * 2);
        set_display_grid();
        set_tiles();
        print_tiles();
    }
    void print_tiles()
    {
        for (int i = 0; i < tiles.size(); i++) {
            for (int j = 0; j < tiles[i].size(); j++) {
                std::cout << tiles[i][j]->get_coords().x << ", ";
                std::cout << tiles[i][j]->get_coords().y << " ||| ";
                
                std::cout << tiles[i][j]->getPosition().x << " -> " << tiles[i][j]->getPosition().x + 2*tiles[i][j]->getRadius() << " | ";
                
                std::cout << tiles[i][j]->getPosition().y << " -> " << tiles[i][j]->getPosition().y + 2*tiles[i][j]->getRadius() << std::endl;
                if (tiles[i][j]->get_player()) {
                    std::cout << "Player: " << tiles[i][j]->get_player() << std::endl;
                }
            }
        }
    }
    sf::Vector2f check_mouse_click_brute_force(sf::Vector2f mouse)
    {
        for (int i = 0; i < tiles.size(); i++) {
            for (int j = 0; j < tiles[i].size(); j++) {
                Tile * tile = tiles[i][j];
                sf::Vector2f coords = tile->getPosition();
                float diameter = tile->getRadius() * 2;
                bool contains = coords.x < mouse.x &&
                                mouse.x < coords.x + diameter &&
                                coords.y < mouse.y &&
                                mouse.y < coords.y + diameter;
                if (contains) {
                    return tile->get_coords();
                }
            }
        }
        return sf::Vector2f(-1, -1);
    }
    sf::Vector2f check_mouse_click(sf::Vector2f mouse)
    {
        using std::cout; using std::endl;
        
        sf::Vector2f coords;
        Tile tile(0, 0);
        float d = (tile.getRadius() * 2) + GRIDLINE_THICKNESS;
        cout << d << endl;
        
        coords.x = mouse.x / d;
        coords.y = mouse.y / d;
        
        
        if (coords.x - int(coords.x) < (GRIDLINE_THICKNESS/100)) {
            coords.x = -1;
        } else {
            coords.x = floor(coords.x);
        }
        if (coords.y - int(coords.y) < (GRIDLINE_THICKNESS/100)) {
            coords.y = -1;
        } else {
            coords.y = floorf(coords.y);
        }
        show_hint(coords);
        cout << coords.x << ", " << coords.y << endl;
    }
    int tiles_flipped_in_direction(sf::Vector2i base, sf::Vector2i direction)
    {
        int tiles = 0;
        sf::Vector2i current(base.x, base.y);
        while (true) {
            current.x += direction.x;
            current.y += direction.y;
            tiles++;
            if (current.x < 0 || current.x >= TILES || current.y < 0 || current.y > TILES) {
                return 0;
            }
        }
        return 0;
    }
    int tiles_flipped_on_move(sf::Vector2i tile)
    {
        int tiles = 0;
        for (int x = -1; x <= 1; x++) {
            for (int y = -1; y <=1; y++) {
                if (x == 0 && y == 0) {
                    continue;
                }
                sf::Vector2i direction(x, y);
                tiles += tiles_flipped_in_direction(tile, direction);
            }
        }
        return tiles;
    }
    void all_valid_moves()
    {
        for (int y = 0; y < tiles.size(); y++) {
            for (int x = 0; x < tiles[y].size(); x++) {
                if (tiles[y][x]->get_player() == player) {
                    sf::Vector2i tile(x, y);
                    int flipped_tiles = tiles_flipped_on_move(tile);
                    if (flipped_tiles > 0) {
                        
                    }
                }
            }
        }
    }
    bool is_valid_move(sf::Vector2f coords)
    {
        
    }
    void show_hint(sf::Vector2f coords)
    {
        hide_hints();
        if (coords.x < 0 || coords.x >= TILES || coords.y < 0 || coords.y >= TILES) {
            return;
        }
        if (is_valid_move(coords)) {
            tiles[coords.y][coords.x]->set_hint_color(1);
        }
        hints.push_back(coords);
    }
    void hide_hints()
    {
        while (hints.size() > 0) {
            sf::Vector2f coords = hints.back();
            tiles[coords.y][coords.x]->set_hint_color(0);
            hints.pop_back();
        }
    }
    void draw()
    {
        window->draw(board_rect);
        draw_grid();
        draw_tiles();
    }
};

int main(int, char const**)
{
    
    // Create Main Window
    sf::VideoMode video_mode(WINDOW_DIMENSTIONS.x, WINDOW_DIMENSTIONS.y);
    sf::RenderWindow * window = new sf::RenderWindow(video_mode, "Othello", sf::Style::Close);
    sf::View view;
    view.reset(sf::FloatRect(-BOARD_OFFSET.x, -BOARD_OFFSET.y, WINDOW_DIMENSTIONS.x, WINDOW_DIMENSTIONS.y));
    view.setViewport(sf::FloatRect(0, 0, 1, 1));

    GameBoard gameboard(window);

    // Main Game Loop
    while (window->isOpen())
    {
        // Process Events
        sf::Event event;
        while (window->pollEvent(event))
        {
            if (event.type == sf::Event::Closed) {
                window->close();
            }
            if (event.type == sf::Event::MouseButtonReleased) {
                gameboard.tiles_flipped_on_move(sf::Vector2i(0, 0));
            }
            if (event.type == sf::Event::MouseMoved) {
                // std::cout << event.mouseButton.x << ", " << event.mouseButton.y << std::endl;
                // sf::Vector2f coords = gameboard.check_mouse_click(sf::Vector2f(event.mouseButton.x - BOARD_OFFSET.x, event.mouseButton.y - BOARD_OFFSET.y));
                
                int x = event.mouseMove.x - (BOARD_OFFSET.x);
                int y = event.mouseMove.y - (BOARD_OFFSET.y);
                
                using std::cout; using std::endl;
                cout << x << ", " << y << endl;
                gameboard.check_mouse_click(sf::Vector2f(x, y));
                // std::cout << coords.x << "|" << new_coords.x << ", " << coords.y << "|" << new_coords.y << std::endl;
            }
        }

        // Clear screen
        window->setView(view);
        window->clear();
        gameboard.draw();
        window->display();
    }

    std::cout << "ByeBye" << std::endl;
    return EXIT_SUCCESS;
}
