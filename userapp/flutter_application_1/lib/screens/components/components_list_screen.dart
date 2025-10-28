import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/component_provider.dart';
import 'add_component_screen.dart';
import 'edit_component_screen.dart';

class ComponentsListScreen extends StatefulWidget {
  final int websiteId;

  const ComponentsListScreen({super.key, required this.websiteId});

  @override
  State<ComponentsListScreen> createState() => _ComponentsListScreenState();
}

class _ComponentsListScreenState extends State<ComponentsListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ComponentProvider>(context, listen: false)
          .fetchWebsiteComponents(widget.websiteId);
    });
  }

  Future<void> _showDeleteDialog(int componentId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Component'),
        content: const Text('Are you sure you want to delete this component?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final provider = Provider.of<ComponentProvider>(context, listen: false);
      final success = await provider.deleteWebsiteComponent(
        widget.websiteId,
        componentId,
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Component deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Components'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => AddComponentScreen(websiteId: widget.websiteId),
                ),
              );
            },
          ),
        ],
      ),
      body: Consumer<ComponentProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading && provider.websiteComponents.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.websiteComponents.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.view_module, size: 80, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text(
                    'No components yet',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Add components to build your website',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              AddComponentScreen(websiteId: widget.websiteId),
                        ),
                      );
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Add Component'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchWebsiteComponents(widget.websiteId),
            child: ReorderableListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.websiteComponents.length,
              onReorder: (oldIndex, newIndex) async {
                if (newIndex > oldIndex) newIndex--;

                final components = List.of(provider.websiteComponents);
                final item = components.removeAt(oldIndex);
                components.insert(newIndex, item);

                final componentIds = components.map((c) => c.id).toList();
                await provider.reorderComponents(widget.websiteId, componentIds);
              },
              itemBuilder: (context, index) {
                final component = provider.websiteComponents[index];
                return Card(
                  key: ValueKey(component.id),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.blue[100],
                      child: Icon(Icons.widgets, color: Colors.blue[800]),
                    ),
                    title: Text(
                      component.componentRegistry.name,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text('Position: ${component.position + 1}'),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: component.visible
                                    ? Colors.green[100]
                                    : Colors.grey[300],
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                component.visible ? 'Visible' : 'Hidden',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: component.visible
                                      ? Colors.green[800]
                                      : Colors.grey[700],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.blue),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => EditComponentScreen(
                                  websiteId: widget.websiteId,
                                  component: component,
                                ),
                              ),
                            );
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _showDeleteDialog(component.id),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => AddComponentScreen(websiteId: widget.websiteId),
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
